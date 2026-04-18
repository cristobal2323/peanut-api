import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ExpoPushService } from './expo-push.service';
import { NotificationListener } from './notification.listener';
import { NotificationsController, UserNotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController, UserNotificationsController],
  providers: [NotificationsService, ExpoPushService, NotificationListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
