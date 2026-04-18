import { Injectable } from '@nestjs/common';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { t, MessageKey } from '../i18n/messages';

@Injectable()
export class ExpoPushService {
  private readonly expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  async sendToUser(
    userId: string,
    message: {
      titleKey: MessageKey;
      bodyKey: MessageKey;
      data?: Record<string, unknown>;
    },
  ) {
    const settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
    if (settings && !settings.pushEnabled) return;

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
    });
    if (tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens
      .filter((tk) => Expo.isExpoPushToken(tk.token))
      .map((tk) => ({
        to: tk.token,
        sound: 'default' as const,
        title: t(tk.locale, message.titleKey),
        body: t(tk.locale, message.bodyKey),
        data: message.data ?? {},
      }));

    if (messages.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error('Expo push chunk error:', err);
      }
    }
  }
}
