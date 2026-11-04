import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      // passport-google lanza un error si clientID está vacío. Con 'no-configurado' la app arranca
      // igual y GoogleEnabledGuard responde 503 antes de llegar a Google.
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'no-configurado',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'no-configurado',
      callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/google/redirect`,
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const email: string | undefined = profile.emails?.[0]?.value;
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

    if (!email) {
      return done(new UnauthorizedException('Google no entregó un correo'), false);
    }
    if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
      return done(new UnauthorizedException('Correo no institucional'), false);
    }

    done(null, { email, name: profile.displayName });
  }
}
