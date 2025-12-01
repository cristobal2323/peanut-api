import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DogsModule } from './dogs/dogs.module';
import { LostReportsModule } from './lost-reports/lost-reports.module';
import { SightingsModule } from './sightings/sightings.module';
import { ScanEventsModule } from './scan-events/scan-events.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    DogsModule,
    LostReportsModule,
    SightingsModule,
    ScanEventsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
