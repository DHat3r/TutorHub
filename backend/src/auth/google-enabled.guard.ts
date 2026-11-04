import {
  CanActivate,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export const isGoogleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// El login con Google es opcional: sin credenciales responde 503 en vez de romper el arranque.
@Injectable()
export class GoogleEnabledGuard implements CanActivate {
  canActivate(): boolean {
    if (!isGoogleConfigured()) {
      throw new ServiceUnavailableException(
        'El inicio de sesión con Google no está configurado.',
      );
    }
    return true;
  }
}
