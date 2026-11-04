import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TutoriasModule } from './tutorias/tutorias.module';
import { ProfileModule } from './profile/profile.module';
import { BookingsModule } from './bookings/bookings.module';
import { CoursesModule } from './courses/courses.module';
import { AvailabilityModule } from './availability/availability.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // SMTP configurable por entorno. En desarrollo apunta a Mailpit (docker compose),
    // que atrapa los correos y los muestra en http://localhost:8025. El original usaba Gmail fijo.
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('SMTP_USER');
        return {
          transport: {
            host: config.get<string>('SMTP_HOST', 'localhost'),
            port: Number(config.get<string>('SMTP_PORT', '1025')),
            secure: config.get<string>('SMTP_SECURE') === 'true',
            auth: user ? { user, pass: config.get<string>('SMTP_PASSWORD') } : undefined,
          },
          defaults: {
            from: config.get<string>('MAIL_FROM', '"TutorHub" <no-reply@tutorhub.local>'),
          },
        };
      },
    }),

    PrismaModule,
    AuthModule,
    TutoriasModule,
    ProfileModule,
    BookingsModule,
    CoursesModule,
    AvailabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
