import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  let prisma: any;
  let service: AvailabilityService;

  beforeEach(() => {
    prisma = {
      tutorProfile: { findUnique: jest.fn() },
      availabilityBlock: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new AvailabilityService(prisma);
  });

  describe('assertBlockOwnedBy', () => {
    it('lanza 404 si el bloque no existe', async () => {
      prisma.availabilityBlock.findUnique.mockResolvedValue(null);
      await expect(service.assertBlockOwnedBy(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lanza 403 si el bloque es de otro tutor', async () => {
      prisma.availabilityBlock.findUnique.mockResolvedValue({ tutor: { userId: 99 } });
      await expect(service.assertBlockOwnedBy(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('blockAvailabilityForSession', () => {
    const at = (h: number) => new Date(`2026-11-10T${String(h).padStart(2, '0')}:00:00.000Z`);
    const block = { id: 1, tutorId: 1, day_of_week: 'MARTES', start_time: at(9), end_time: at(17) };

    it('borra el bloque si la sesión lo cubre entero', async () => {
      prisma.availabilityBlock.findMany.mockResolvedValue([block]);
      await service.blockAvailabilityForSession(1, at(8), at(18));
      expect(prisma.availabilityBlock.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('parte el bloque en dos si la sesión cae al medio', async () => {
      prisma.availabilityBlock.findMany.mockResolvedValue([block]);
      await service.blockAvailabilityForSession(1, at(12), at(13));

      // El bloque original queda de 9 a 12 y se crea otro de 13 a 17.
      expect(prisma.availabilityBlock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { end_time: at(12) },
      });
      expect(prisma.availabilityBlock.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ start_time: at(13), end_time: at(17) }),
      });
    });
  });
});
