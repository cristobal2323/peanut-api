import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController, UserNotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController, UserNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
