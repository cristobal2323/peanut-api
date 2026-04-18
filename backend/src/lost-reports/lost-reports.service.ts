import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LostReportStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';
import {
  ListPublicLostReportsDto,
  PublicStatusFilter,
} from './dto/list-public-lost-reports.dto';
import { t } from '../i18n/messages';
import {
  LOST_REPORT_CREATED,
  LOST_REPORT_STATUS_CHANGED,
  LostReportCreatedEvent,
  LostReportStatusChangedEvent,
} from '../notifications/events/notification.events';

type Tx = Prisma.TransactionClient;

@Injectable()
export class LostReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(ownerId: string, payload: CreateLostReportDto, lang?: string) {
    const result = await this.prisma.$transaction(async (tx: Tx) => {
      const dog = await tx.dog.findUnique({ where: { id: payload.dogId } });
      if (!dog) {
        throw new HttpException(t(lang, 'DOG_NOT_FOUND'), HttpStatus.NOT_FOUND);
      }
      if (dog.ownerId !== ownerId) {
        throw new HttpException(t(lang, 'OWNER_MISMATCH_FOR_DOG'), HttpStatus.FORBIDDEN);
      }

      const existingActive = await tx.lostReport.findFirst({
        where: { dogId: payload.dogId, status: LostReportStatus.ACTIVE },
      });
      if (existingActive) {
        throw new HttpException(t(lang, 'LOST_REPORT_ALREADY_ACTIVE'), HttpStatus.CONFLICT);
      }

      let lastSeenLocationId: string | undefined;
      if (payload.lastSeenLatitude !== undefined && payload.lastSeenLongitude !== undefined) {
        const loc = await tx.location.create({
          data: {
            latitude: payload.lastSeenLatitude,
            longitude: payload.lastSeenLongitude,
            addressText: payload.lastSeenAddress,
          },
        });
        lastSeenLocationId = loc.id;
      }

      const lastSeenAt = payload.lastSeenAt ? new Date(payload.lastSeenAt) : new Date();

      const report = await tx.lostReport.create({
        data: {
          dogId: payload.dogId,
          ownerId,
          description: payload.description,
          lastSeenLocationId,
          lastSeenAt,
          status: LostReportStatus.ACTIVE,
          rewardOffered: payload.rewardOffered,
        },
        include: {
          dog: true,
          lastSeenLocation: true,
        },
      });

      await tx.dog.update({
        where: { id: payload.dogId },
        data: { lostStatus: true, lostSince: lastSeenAt },
      });

      return report;
    });

    const loc = result.lastSeenLocation;
    if (loc) {
      this.eventEmitter.emit(
        LOST_REPORT_CREATED,
        new LostReportCreatedEvent(
          result.id,
          ownerId,
          result.dog?.name ?? 'Perro',
          loc.latitude,
          loc.longitude,
        ),
      );
    }

    return result;
  }

  async listByOwner(ownerId: string, skip = 0, take = 20) {
    const items = await this.prisma.lostReport.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        dog: { include: { breed: true, color: true } },
        lastSeenLocation: true,
      },
    });
    const nextCursor = items.length === take ? skip + take : null;
    return { items, nextCursor };
  }

  async getActive() {
    return this.prisma.lostReport.findMany({
      where: { status: LostReportStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: {
        dog: { include: { breed: true, color: true } },
        owner: { select: { id: true, name: true } },
        lastSeenLocation: true,
      },
    });
  }

  async listPublic(filter: ListPublicLostReportsDto = {}) {
    const skip = filter.skip ?? 0;
    const take = filter.take ?? 20;

    const statusIn =
      filter.status === PublicStatusFilter.ACTIVE
        ? [LostReportStatus.ACTIVE]
        : filter.status === PublicStatusFilter.RESOLVED
          ? [LostReportStatus.RESOLVED]
          : [LostReportStatus.ACTIVE, LostReportStatus.RESOLVED];

    const dogFilter: Prisma.DogWhereInput = {};
    if (filter.breedIds && filter.breedIds.length) {
      dogFilter.breedId = { in: filter.breedIds };
    } else if (filter.breedId) {
      dogFilter.breedId = filter.breedId;
    }
    if (filter.colorIds && filter.colorIds.length) {
      dogFilter.colorId = { in: filter.colorIds };
    } else if (filter.colorId) {
      dogFilter.colorId = filter.colorId;
    }

    let locationFilter: Prisma.LocationWhereInput | undefined;
    let requireLocation = false;

    if (
      filter.minLat !== undefined &&
      filter.maxLat !== undefined &&
      filter.minLng !== undefined &&
      filter.maxLng !== undefined
    ) {
      const latRange = { gte: filter.minLat, lte: filter.maxLat };
      if (filter.minLng <= filter.maxLng) {
        locationFilter = {
          latitude: latRange,
          longitude: { gte: filter.minLng, lte: filter.maxLng },
        };
      } else {
        locationFilter = {
          latitude: latRange,
          OR: [
            { longitude: { gte: filter.minLng, lte: 180 } },
            { longitude: { gte: -180, lte: filter.maxLng } },
          ],
        };
      }
      requireLocation = true;
    } else if (
      filter.maxKm !== undefined &&
      filter.lat !== undefined &&
      filter.lng !== undefined
    ) {
      const latDeg = filter.maxKm / 111;
      const lngDeg =
        filter.maxKm / (111 * Math.cos((filter.lat * Math.PI) / 180));
      locationFilter = {
        latitude: { gte: filter.lat - latDeg, lte: filter.lat + latDeg },
        longitude: { gte: filter.lng - lngDeg, lte: filter.lng + lngDeg },
      };
      requireLocation = true;
    }

    const where: Prisma.LostReportWhereInput = {
      status: { in: statusIn },
      ...(Object.keys(dogFilter).length ? { dog: { is: dogFilter } } : {}),
      ...(requireLocation
        ? {
            lastSeenLocationId: { not: null },
            lastSeenLocation: { is: locationFilter },
          }
        : {}),
      ...(filter.since ? { createdAt: { gte: new Date(filter.since) } } : {}),
      ...(filter.search
        ? {
            OR: [
              {
                dog: {
                  is: {
                    name: { contains: filter.search, mode: 'insensitive' },
                  },
                },
              },
              { description: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const items = await this.prisma.lostReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        dog: { include: { breed: true, color: true } },
        owner: { select: { id: true, name: true } },
        lastSeenLocation: true,
      },
    });

    const nextCursor = items.length === take ? skip + take : null;
    return { items, nextCursor };
  }

  async getById(id: string, lang?: string) {
    const report = await this.prisma.lostReport.findUnique({
      where: { id },
      include: {
        dog: { include: { breed: true, color: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
        lastSeenLocation: true,
        sightings: {
          include: {
            location: true,
            image: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!report) {
      throw new HttpException(t(lang, 'LOST_REPORT_NOT_FOUND'), HttpStatus.NOT_FOUND);
    }
    return report;
  }

  async resolve(id: string, ownerId: string, lang?: string) {
    return this.changeStatus(id, ownerId, LostReportStatus.RESOLVED, lang);
  }

  async cancel(id: string, ownerId: string, lang?: string) {
    return this.changeStatus(id, ownerId, LostReportStatus.CANCELLED, lang);
  }

  private async changeStatus(
    id: string,
    ownerId: string,
    nextStatus: LostReportStatus,
    lang?: string,
  ) {
    const report = await this.prisma.lostReport.findUnique({ where: { id } });
    if (!report) {
      throw new HttpException(t(lang, 'LOST_REPORT_NOT_FOUND'), HttpStatus.NOT_FOUND);
    }
    if (report.ownerId !== ownerId) {
      throw new HttpException(t(lang, 'OWNER_MISMATCH_FOR_DOG'), HttpStatus.FORBIDDEN);
    }
    if (report.status !== LostReportStatus.ACTIVE) {
      throw new HttpException(t(lang, 'LOST_REPORT_NOT_ACTIVE'), HttpStatus.BAD_REQUEST);
    }

    const result = await this.prisma.$transaction(async (tx: Tx) => {
      const updated = await tx.lostReport.update({
        where: { id },
        data: { status: nextStatus },
        include: {
          dog: true,
          lastSeenLocation: true,
        },
      });
      await tx.dog.update({
        where: { id: report.dogId },
        data: { lostStatus: false, lostSince: null },
      });
      return updated;
    });

    this.eventEmitter.emit(
      LOST_REPORT_STATUS_CHANGED,
      new LostReportStatusChangedEvent(
        id,
        report.dogId,
        report.ownerId,
        nextStatus as 'RESOLVED' | 'CANCELLED',
      ),
    );

    return result;
  }
}
