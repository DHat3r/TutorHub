import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TutoriasService } from './tutorias.service';

describe('TutoriasService', () => {
  let prisma: any;
  let service: TutoriasService;

  beforeEach(() => {
    prisma = {
      tutorProfile: { findUnique: jest.fn() },
      tutoringSession: { findUnique: jest.fn(), create: jest.fn() },
    };
    service = new TutoriasService(prisma, { sendMail: jest.fn() } as any);
  });

  describe('assertOwnedBy', () => {
    it('lanza 404 si la tutoría no existe', async () => {
      prisma.tutoringSession.findUnique.mockResolvedValue(null);
      await expect(service.assertOwnedBy(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lanza 403 si la tutoría es de otro tutor', async () => {
      prisma.tutoringSession.findUnique.mockResolvedValue({ tutor: { userId: 99 } });
      await expect(service.assertOwnedBy(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('no lanza nada si la tutoría es del usuario', async () => {
      prisma.tutoringSession.findUnique.mockResolvedValue({ tutor: { userId: 10 } });
      await expect(service.assertOwnedBy(1, 10)).resolves.toBeUndefined();
    });
  });

  describe('getTutorProfileIdOrFail', () => {
    it('lanza 403 si el usuario no tiene perfil de tutor', async () => {
      prisma.tutorProfile.findUnique.mockResolvedValue(null);
      await expect(service.getTutorProfileIdOrFail(5)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('devuelve el id del perfil de tutor', async () => {
      prisma.tutorProfile.findUnique.mockResolvedValue({ id: 42 });
      await expect(service.getTutorProfileIdOrFail(5)).resolves.toBe(42);
    });
  });

  describe('create', () => {
    const base = {
      tutorId: 1,
      courseId: 2,
      title: 'Repaso de cálculo',
      description: 'Derivadas',
      date: '2026-11-10T00:00:00.000Z',
      start_time: '2026-11-10T15:00:00.000Z',
      end_time: '2026-11-10T16:00:00.000Z',
    };

    it('responde 400 si falta un campo obligatorio', async () => {
      await expect(service.create({ ...base, title: '' })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('calcula la fecha del día a partir de la hora de inicio', async () => {
      prisma.tutoringSession.create.mockImplementation(({ data }) => data);
      const created: any = await service.create(base);
      expect(created.date.toISOString()).toBe('2026-11-10T00:00:00.000Z');
      expect(created.tutorId).toBe(1);
    });
  });
});
