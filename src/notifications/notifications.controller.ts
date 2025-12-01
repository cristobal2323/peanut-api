import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MarkNotificationsReadDto } from './dto/mark-notifications-read.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('mark-read')
  markRead(@Body() body: MarkNotificationsReadDto) {
    return this.notificationsService.markRead(body);
  }
}

@Controller('users/:userId/notifications')
export class UserNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Param('userId') userId: string) {
    return this.notificationsService.listForUser(userId);
  }
}
