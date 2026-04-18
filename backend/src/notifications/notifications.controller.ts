import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MarkNotificationsReadDto } from './dto/mark-notifications-read.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UnregisterPushTokenDto } from './dto/unregister-push-token.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('mine')
  listMine(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.listForUser(
      req.user.sub,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Post('mark-read')
  markRead(@Body() body: MarkNotificationsReadDto) {
    return this.notificationsService.markRead(body);
  }

  @Post('mark-all-read')
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.sub);
  }

  @Post('push-token')
  registerPushToken(@Body() body: RegisterPushTokenDto, @Req() req: any) {
    return this.notificationsService.registerPushToken(
      req.user.sub,
      body.token,
      body.platform,
      body.locale,
    );
  }

  @Delete('push-token')
  unregisterPushToken(@Body() body: UnregisterPushTokenDto, @Req() req: any) {
    return this.notificationsService.unregisterPushToken(req.user.sub, body.token);
  }

  @Get('settings')
  getSettings(@Req() req: any) {
    return this.notificationsService.getSettings(req.user.sub);
  }

  @Patch('settings')
  updateSettings(
    @Body() body: UpdateNotificationSettingsDto,
    @Req() req: any,
  ) {
    return this.notificationsService.updateSettings(req.user.sub, body);
  }
}

@Controller('users/:userId/notifications')
export class UserNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.listForUser(
      userId,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }
}
