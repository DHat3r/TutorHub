import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Seed idempotente (upsert): se puede correr varias veces sin duplicar datos.
// Crea los ramos, dos usuarios de demo ya verificados y tres tutorías futuras.
// El original solo creaba ramos; el resto del archivo era código comentado.

const prisma = new PrismaClient();

// Helper para obtener un área de materia basada en el nombre del curso
function getSubjectAreaFromName(courseName: string): string {
  const lowerCaseName = courseName.toLowerCase();
  if (
    lowerCaseName.includes('cálculo') ||
    lowerCaseName.includes('álgebra') ||
    lowerCaseName.includes('ecuaciones')
  )
    return 'Matemáticas';
  if (
    lowerCaseName.includes('programación') ||
    lowerCaseName.includes('datos') ||
    lowerCaseName.includes('software') ||
    lowerCaseName.includes('computadores') ||
    lowerCaseName.includes('sistemas operativos') ||
    lowerCaseName.includes('redes')
  )
    return 'Informática';
  if (
    lowerCaseName.includes('física') ||
    lowerCaseName.includes('mecánica') ||
    lowerCaseName.includes('termodinámica') ||
    lowerCaseName.includes('electricidad') ||
    lowerCaseName.includes('ondas')
  )
    return 'Física';
  if (lowerCaseName.includes('química')) return 'Química';
  if (
    lowerCaseName.includes('economía') ||
    lowerCaseName.includes('finanzas') ||
    lowerCaseName.includes('contabilidad')
  )
    return 'Economía y Finanzas';
  if (
    lowerCaseName.includes('estadística') ||
    lowerCaseName.includes('probabilidades')
  )
    return 'Estadística';
  if (lowerCaseName.includes('inglés')) return 'Idiomas';
  if (lowerCaseName.includes('proyecto') || lowerCaseName.includes('taller'))
    return 'Proyectos y Talleres';
  if (
    lowerCaseName.includes('industrial') ||
    lowerCaseName.includes('operaciones') ||
    lowerCaseName.includes('logística') ||
    lowerCaseName.includes('gestión')
  )
    return 'Ingeniería Industrial';
  if (
    lowerCaseName.includes('civil') ||
    lowerCaseName.includes('estructural') ||
    lowerCaseName.includes('hormigón') ||
    lowerCaseName.includes('suelos') ||
    lowerCaseName.includes('hidráulica') ||
    lowerCaseName.includes('ambiental') ||
    lowerCaseName.includes('edificación')
  )
    return 'Ingeniería Civil';
  return 'General';
}

async function seedCourses() {
  const newCourseNames = [
    'ADM DE PROYECTOS CIVILES', 'ARQUITECTURA DE SOFTWARE', 'ARQUITECTURA Y ORGANIZ DE COMPUTADORES', 
    'ARQUITECTURAS EMERGENTES', 'ANÁLISIS ESTRUCTURAL', 'BASES DE DATOS', 'BASES DE DATOS AVANZADAS', 
    'BIM', 'CALOR Y ONDAS', 'COMUNICACIONES DIGITALES', 'COMUNICACIÓN PARA LA INGENIERÍA', 
    'CONTABILIDAD Y COSTOS', 'CRIPTOGRAFÍA Y SEGURIDAD EN REDES', 'CÁLCULO I', 'CÁLCULO II', 
    'CÁLCULO III', 'DATA SCIENCE', 'DESARROLLO WEB Y MÓVIL', 'DISEÑO EN ACERO', 
    'DISEÑO EN HORMIGÓN', 'DISEÑO ESTRUCTURAL', 'DISEÑO DE CAMINOS', 'ECUACIONES DIFERENCIALES', 
    'EDIFICACIÓN', 'ELECTRICIDAD Y MAGNETISMO', 'ELECTRÓNICA Y ELECTROTECNIA', 
    'ESTRUCTURAS DE DATOS Y ALGORITMOS', 'ESTÁTICA', 'EVALUACIÓN DE PROYECTOS', 
    'EVALUACIÓN DE PROYECTOS TIC', 'FINANZAS', 'FUNDACIONES', 'GESTIÓN ORGANIZACIONAL', 
    'HIDROLOGÍA', 'HIDRÁULICA', 'HIDRÁULICA URBANA', 'INGENIERIA ECONÓMICA', 
    'INGENIERÍA AMBIENTAL', 'INGENIERÍA DE COSTOS', 'INGENIERÍA DE SOFTWARE', 
    'INGENIERÍA EN MATERIALES', 'INGENIERÍA SÍSMICA', 'INFERENCIA ESTADÍSTICA', 
    'INTELIGENCIA ARTIFICIAL', 'INTRODUCCIÓN  A LA ECONOMÍA', // Note double space
    'LIDERAZGO Y EMPRENDIMIENTO', 'LOGÍSTICA', 'MECÁNICA', 'MECÁNICA DE FLUIDOS', 
    'MECÁNICA DE SUELOS', 'MECÁNICA DE SÓLIDOS', 'MICROECONOMETRÍA', 'MICROECONOMÍA', 
    'MODELOS ESTOCÁSTICOS', 'OPTIMIZACIÓN', 'PLANIFICACIÓN DE PROYECTOS', 
    'PROBABILIDADES Y ESTADÍSTICA', 'PRODUCCIÓN', 'PROGRAMACIÓN', 'PROGRAMACIÓN AVANZADA', 
    'PROYECTO EN TICS I', 'PROYECTO EN TICS II', 'PROYECTOS ENERGÉTICOS', 'QUÍMICA', 
    'REDES DE DATOS', 'SEMINARIO CS. INGENIERÍA', 'SEÑALES Y SISTEMAS', 'SIMULACIÓN', 
    'SISTEMAS DISTRIBUIDOS', 'SISTEMAS OPERATIVOS', 'TALLER DE INGENIERIA INDUSTRIAL', 
    'TALLER DE REDES Y SERVICIOS', 'TECNOLOGÍA DEL HORMIGÓN', 'TECNOLOGÍAS INALÁMBRICAS', 
    'TEORÍA ORGANIZACIÓNAL', 'TERMODINÁMICA', 'TOPOGRAFÍA', 'ÁLGEBRA LINEAL', 
    'ÁLGEBRA Y GEOMETRÍA'
  ];


  for (const raw of newCourseNames) {
    const name = raw.replace(/\s\s+/g, ' ');
    const subject_area = getSubjectAreaFromName(name);
    await prisma.course.upsert({
      where: { name },
      update: { subject_area },
      create: { name, subject_area },
    });
  }
  console.log(`${newCourseNames.length} ramos listos.`);
}

// Contraseña de los usuarios de demo. Solo para desarrollo local.
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'demo1234';

async function upsertUser(email: string, full_name: string, role: Role) {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      full_name,
      role,
      password,
      email_verified: true,
      NotificationPreference: { create: {} },
    },
  });
}

async function seedDemoUsers() {
  const tutorUser = await upsertUser('tutor@tutorhub.dev', 'Tamara Tutora', Role.TUTOR);
  const tutor = await prisma.tutorProfile.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      bio: 'Ayudante de Cálculo y Programación. Me gusta explicar con ejemplos.',
      university: 'Universidad Diego Portales',
      degree: 'Ingeniería Civil en Informática',
      academic_year: '5',
    },
  });

  const studentUser = await upsertUser('estudiante@tutorhub.dev', 'Esteban Estudiante', Role.STUDENT);
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      university: 'Universidad Diego Portales',
      career: 'Ingeniería Civil Industrial',
      study_year: 2,
    },
  });

  return tutor;
}

async function seedTutorings(tutorId: number) {
  const existing = await prisma.tutoringSession.count({ where: { tutorId } });
  if (existing > 0) return;

  // Nombre del ramo en la base (mayúsculas) y cómo se muestra en el título.
  const demoCourses = [
    ['CÁLCULO I', 'Cálculo I'],
    ['PROGRAMACIÓN', 'Programación'],
    ['ÁLGEBRA LINEAL', 'Álgebra Lineal'],
  ];
  for (const [i, [name, displayName]] of demoCourses.entries()) {
    const course = await prisma.course.findUniqueOrThrow({ where: { name } });
    await prisma.tutorCourse.upsert({
      where: { tutorId_courseId: { tutorId, courseId: course.id } },
      update: {},
      create: { tutorId, courseId: course.id, level: 'Avanzado', grade: 6.5 },
    });

    // Tutorías en los próximos días, de 10:00 a 11:30 UTC.
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + i + 2);
    start.setUTCHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 90 * 60 * 1000);

    await prisma.tutoringSession.create({
      data: {
        tutorId,
        courseId: course.id,
        title: `Repaso de ${displayName}`,
        description: 'Repasamos la materia de la prueba con ejercicios resueltos.',
        date: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())),
        start_time: start,
        end_time: end,
        status: BookingStatus.AVAILABLE,
        location: 'Biblioteca, sala 2',
      },
    });
  }
  console.log('3 tutorías de demo creadas.');
}

async function main() {
  await seedCourses();
  const tutor = await seedDemoUsers();
  await seedTutorings(tutor.id);
  console.log(`Usuarios de demo: tutor@tutorhub.dev y estudiante@tutorhub.dev (contraseña: ${DEMO_PASSWORD}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
