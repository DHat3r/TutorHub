import { HttpException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Role } from './dto/register.dto';

// Tests unitarios: Prisma, JWT y el correo se reemplazan por dobles (jest.fn),
// así se prueba solo la lógica del servicio, sin base de datos.
describe('AuthService', () => {
  let prisma: any;
  let jwt: { sign: jest.Mock; verify: jest.Mock };
  let mailer: { sendMail: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      notificationPreference: { create: jest.fn() },
      studentProfile: { create: jest.fn(), upsert: jest.fn() },
      tutorProfile: { create: jest.fn(), upsert: jest.fn() },
      loginAttempt: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    };
    jwt = { sign: jest.fn().mockReturnValue('token-firmado'), verify: jest.fn() };
    mailer = { sendMail: jest.fn() };
    service = new AuthService(prisma, jwt as any, mailer as any);
  });

  describe('register', () => {
    const dto = { full_name: 'Ana', email: 'ana@test.dev', password: 'secreto123', role: Role.STUDENT };

    it('rechaza un correo ya registrado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      await expect(service.register(dto)).rejects.toBeInstanceOf(HttpException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('guarda la contraseña hasheada, crea el perfil y envía el correo de verificación', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) => ({ id: 7, ...data }));

      const result = await service.register(dto);

      const saved = prisma.user.create.mock.calls[0][0].data;
      expect(saved.password).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, saved.password)).toBe(true);
      expect(prisma.studentProfile.create).toHaveBeenCalled();
      expect(prisma.tutorProfile.create).not.toHaveBeenCalled();
      expect(mailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: dto.email }));
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    const dto = { email: 'ana@test.dev', password: 'secreto123' };
    const userWith = async (overrides = {}) => ({
      id: 1,
      email: dto.email,
      role: 'STUDENT',
      email_verified: true,
      password: await bcrypt.hash(dto.password, 4),
      ...overrides,
    });

    it('rechaza a un usuario que no verificó su correo', async () => {
      prisma.user.findUnique.mockResolvedValue(await userWith({ email_verified: false }));
      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza una contraseña incorrecta y registra el intento fallido', async () => {
      prisma.user.findUnique.mockResolvedValue(await userWith());
      await expect(service.login({ ...dto, password: 'otra' })).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.loginAttempt.create).toHaveBeenCalledWith({ data: { userId: 1, success: false } });
    });

    it('bloquea después de 5 intentos fallidos seguidos', async () => {
      prisma.user.findUnique.mockResolvedValue(await userWith());
      prisma.loginAttempt.findMany.mockResolvedValue(Array(5).fill({ success: false }));
      await expect(service.login(dto)).rejects.toThrow('Demasiados intentos');
    });

    it('devuelve el token y el usuario sin contraseña', async () => {
      prisma.user.findUnique.mockResolvedValue(await userWith());
      const result = await service.login(dto);
      expect(result.access_token).toBe('token-firmado');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('assignRole', () => {
    it('crea el perfil de tutor y devuelve un token con el rol nuevo', async () => {
      prisma.user.update.mockResolvedValue({ id: 3, email: 'x@test.dev', role: 'TUTOR' });

      const token = await service.assignRole(3, Role.TUTOR);

      expect(prisma.tutorProfile.upsert).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith({ sub: 3, email: 'x@test.dev', role: 'TUTOR' });
      expect(token).toBe('token-firmado');
    });
  });
});
