import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import {
  SIGHTING_CREATED,
  LOST_REPORT_CREATED,
  LOST_REPORT_STATUS_CHANGED,
  SightingCreatedEvent,
  LostReportCreatedEvent,
  LostReportStatusChangedEvent,
} from './events/notification.events';

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(sa)));
}

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(LOST_REPORT_CREATED)
  async handleLostReportCreated(event: LostReportCreatedEvent) {
    const MAX_RADIUS_KM = 100;
    const latDeg = MAX_RADIUS_KM / 111;
    const lngDeg =
      MAX_RADIUS_KM / (111 * Math.cos((event.latitude * Math.PI) / 180));

    const nearbyUsers = await this.prisma.notificationSettings.findMany({
      where: {
        nearbyEnabled: true,
        latitude: {
          gte: event.latitude - latDeg,
          lte: event.latitude + latDeg,
        },
        longitude: {
          gte: event.longitude - lngDeg,
          lte: event.longitude + lngDeg,
        },
        userId: { not: event.ownerId },
      },
    });

    for (const settings of nearbyUsers) {
      if (settings.latitude == null || settings.longitude == null) continue;

      const dist = haversineKm(
        { latitude: event.latitude, longitude: event.longitude },
        { latitude: settings.latitude, longitude: settings.longitude },
      );
      if (dist > settings.lostAlertsRadiusKm) continue;

      await this.notifications.create({
        userId: settings.userId,
        type: 'NEARBY_LOST_REPORT',
        payload: {
          lostReportId: event.lostReportId,
          dogName: event.dogName,
          distanceKm: Math.round(dist * 10) / 10,
        },
        pushTitleKey: 'NOTIF_NEARBY_LOST_REPORT_TITLE',
        pushBodyKey: 'NOTIF_NEARBY_LOST_REPORT_BODY',
        pushData: { lostReportId: event.lostReportId },
      });
    }
  }

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
