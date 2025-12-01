import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkNotificationsReadDto } from './dto/mark-notifications-read.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(payload: MarkNotificationsReadDto) {
    const result = await this.prisma.notification.updateMany({
      where: { id: { in: payload.notificationIds } },
      data: { read: true },
    });
    return { updatedCount: result.count };
  }
}
