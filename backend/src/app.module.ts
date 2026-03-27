import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { DogsModule } from './dogs/dogs.module';
import { LostReportsModule } from './lost-reports/lost-reports.module';
import { SightingsModule } from './sightings/sightings.module';
import { ScanEventsModule } from './scan-events/scan-events.module';
import { NotificationsModule } from './notifications/notifications.module';

const jwtExpiresIn: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
    MailModule,
    UsersModule,
    DogsModule,
    LostReportsModule,
    SightingsModule,
    ScanEventsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
