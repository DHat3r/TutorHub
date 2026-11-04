import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

// Test e2e: levanta la app completa contra un Postgres real con el seed aplicado
// (en CI lo hace el workflow; en local, `docker compose up db` + migrate + seed).
// Comprueba los huecos de seguridad que tenía el proyecto original.
describe('Seguridad de la API (e2e)', () => {
  let app: INestApplication;
  let tutorCookie: string;
  let studentCookie: string;

  const login = async (email: string) => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: process.env.SEED_DEMO_PASSWORD || 'demo1234' })
      .expect(201);
    return res.headers['set-cookie'][0];
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Mismo setup que main.ts
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    tutorCookie = await login('tutor@tutorhub.dev');
    studentCookie = await login('estudiante@tutorhub.dev');
  });

  afterAll(() => app.close());

  it('la lista de tutorías es pública', () =>
    request(app.getHttpServer()).get('/tutorias').expect(200));

  it('crear una tutoría sin sesión responde 401', () =>
    request(app.getHttpServer()).post('/tutorias').send({}).expect(401));

  it('un estudiante no puede crear tutorías', async () => {
    const courses = await request(app.getHttpServer()).get('/courses');
    await request(app.getHttpServer())
      .post('/tutorias')
      .set('Cookie', studentCookie)
      .send({
        courseId: courses.body[0].id,
        title: 'No debería crearse',
        description: 'x',
        date: '2030-01-10T00:00:00.000Z',
        start_time: '2030-01-10T15:00:00.000Z',
        end_time: '2030-01-10T16:00:00.000Z',
      })
      .expect(403);
  });

  it('el tutor crea una tutoría a su nombre aunque mande otro tutorId', async () => {
    const me = await request(app.getHttpServer()).get('/profile/me').set('Cookie', tutorCookie);
    const courses = await request(app.getHttpServer()).get('/courses');

    const res = await request(app.getHttpServer())
      .post('/tutorias')
      .set('Cookie', tutorCookie)
      .send({
        tutorId: 9999,
        courseId: courses.body[0].id,
        title: 'Tutoría del test e2e',
        description: 'Se borra al final del test',
        date: '2030-01-10T00:00:00.000Z',
        start_time: '2030-01-10T15:00:00.000Z',
        end_time: '2030-01-10T16:00:00.000Z',
      })
      .expect(201);

    expect(res.body.tutorId).toBe(me.body.tutorProfile.id);

    // Un estudiante no puede borrarla; el tutor sí.
    await request(app.getHttpServer()).delete(`/tutorias/${res.body.id}`).set('Cookie', studentCookie).expect(403);
    await request(app.getHttpServer()).delete(`/tutorias/${res.body.id}`).set('Cookie', tutorCookie).expect(200);
  });

  it('assign-role sin sesión responde 401', () =>
    request(app.getHttpServer()).post('/auth/assign-role').send({ role: 'TUTOR', userId: 1 }).expect(401));

  it('los estudiantes de una tutoría no se ven sin sesión', () =>
    request(app.getHttpServer()).get('/tutorias/1/students').expect(401));

  it('el login con Google sin configurar responde 503', () =>
    request(app.getHttpServer()).get('/auth/google').expect(503));
});
