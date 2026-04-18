import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExpoPushService } from './expo-push.service';
import { MarkNotificationsReadDto } from './dto/mark-notifications-read.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { t, MessageKey } from '../i18n/messages';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expoPush: ExpoPushService,
  ) {}

  async create(params: {
    userId: string;
    type: NotificationType;
    payload: Record<string, unknown>;
    pushTitleKey: MessageKey;
    pushBodyKey: MessageKey;
    pushData?: Record<string, unknown>;
  }) {
    const firstToken = await this.prisma.deviceToken.findFirst({
      where: { userId: params.userId },
      select: { locale: true },
    });
    const locale = firstToken?.locale ?? 'es';

    const title = t(locale, params.pushTitleKey);
    const body = t(locale, params.pushBodyKey);

    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        payload: { ...params.payload, title, body },
      },
    });

    this.expoPush
      .sendToUser(params.userId, {
        titleKey: params.pushTitleKey,
        bodyKey: params.pushBodyKey,
        data: {
          notificationId: notification.id,
          type: params.type,
          ...(params.pushData ?? {}),
        },
      })
      .catch((err) => console.error('Push send error:', err));

    return notification;
  }

  async listForUser(userId: string, skip = 0, take = 20) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    const nextCursor = items.length === take ? skip + take : null;
    return { items, nextCursor };
  }

  async markRead(payload: MarkNotificationsReadDto) {
    const result = await this.prisma.notification.updateMany({
      where: { id: { in: payload.notificationIds } },
      data: { read: true },
    });
    return { updatedCount: result.count };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updatedCount: result.count };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async registerPushToken(
    userId: string,
    token: string,
    platform: string,
    locale?: string,
    latitude?: number,
    longitude?: number,
  ) {
    return this.prisma.deviceToken.upsert({
      where: { token },
      create: {
        userId,
        token,
        platform,
        locale: locale ?? 'es',
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
      update: {
        userId,
        platform,
        ...(locale ? { locale } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      },
    });
  }

  async unregisterPushToken(userId: string, token: string) {
    const existing = await this.prisma.deviceToken.findUnique({
      where: { token },
    });
    if (existing && existing.userId === userId) {
      await this.prisma.deviceToken.delete({ where: { token } });
    }
    return { success: true };
  }

  async getSettings(userId: string) {
    return this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
  }

  async updateSettings(userId: string, data: UpdateNotificationSettingsDto) {
    return this.prisma.notificationSettings.update({
      where: { userId },
      data,
    });
  }
}
