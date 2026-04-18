import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import {
  SIGHTING_CREATED,
  LOST_REPORT_STATUS_CHANGED,
  SightingCreatedEvent,
  LostReportStatusChangedEvent,
} from './events/notification.events';

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(SIGHTING_CREATED)
  async handleSightingCreated(event: SightingCreatedEvent) {
    if (!event.lostReportId) return;

    const lostReport = await this.prisma.lostReport.findUnique({
      where: { id: event.lostReportId },
      select: { ownerId: true },
    });
    if (!lostReport) return;
    if (lostReport.ownerId === event.reporterUserId) return;

    await this.notifications.create({
      userId: lostReport.ownerId,
      type: 'NEW_SIGHTING',
      payload: {
        sightingId: event.sightingId,
        lostReportId: event.lostReportId,
      },
      pushTitleKey: 'NOTIF_NEW_SIGHTING_TITLE',
      pushBodyKey: 'NOTIF_NEW_SIGHTING_BODY',
      pushData: {
        sightingId: event.sightingId,
        lostReportId: event.lostReportId,
      },
    });
  }

  @OnEvent(LOST_REPORT_STATUS_CHANGED)
  async handleLostReportStatusChanged(event: LostReportStatusChangedEvent) {
    const sightings = await this.prisma.sighting.findMany({
      where: { lostReportId: event.lostReportId },
      select: { userId: true },
      distinct: ['userId'],
    });

    const titleKey =
      event.newStatus === 'RESOLVED'
        ? 'NOTIF_LOST_REPORT_RESOLVED_TITLE'
        : 'NOTIF_LOST_REPORT_CANCELLED_TITLE';
    const bodyKey =
      event.newStatus === 'RESOLVED'
        ? 'NOTIF_LOST_REPORT_RESOLVED_BODY'
        : 'NOTIF_LOST_REPORT_CANCELLED_BODY';

    for (const { userId } of sightings) {
      if (userId === event.ownerId) continue;

      await this.notifications.create({
        userId,
        type: 'LOST_REPORT_UPDATED',
        payload: {
          lostReportId: event.lostReportId,
          dogId: event.dogId,
          newStatus: event.newStatus,
        },
        pushTitleKey: titleKey,
        pushBodyKey: bodyKey,
        pushData: { lostReportId: event.lostReportId },
      });
    }
  }
}
