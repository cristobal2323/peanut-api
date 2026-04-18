import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, SightingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { ListPublicSightingsDto } from './dto/list-public-sightings.dto';
import {
  SIGHTING_CREATED,
  SightingCreatedEvent,
} from '../notifications/events/notification.events';

const SIGHTING_INCLUDE = {
  location: true,
  image: true,
  user: { select: { id: true, name: true } },
  dog: { include: { breed: true, color: true } },
} as const;

@Injectable()
export class SightingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, payload: CreateSightingDto) {
    const location = await this.prisma.location.create({
      data: {
        latitude: payload.latitude,
        longitude: payload.longitude,
        addressText: payload.addressText,
      },
    });

    const media = payload.imageUrl
      ? await this.prisma.media.create({
          data: {
            url: payload.imageUrl,
            type: 'image',
            source: 'user_upload',
            createdByUserId: userId,
          },
        })
      : null;

    const sighting = await this.prisma.sighting.create({
      data: {
        userId,
        dogId: payload.dogId,
        lostReportId: payload.lostReportId,
        locationId: location.id,
        imageId: media?.id,
        notes: payload.notes,
      },
      include: SIGHTING_INCLUDE,
    });

    this.eventEmitter.emit(
      SIGHTING_CREATED,
      new SightingCreatedEvent(
        sighting.id,
        payload.lostReportId ?? null,
        userId,
      ),
    );

    return sighting;
  }

  async listPublic(filter: ListPublicSightingsDto = {}) {
    const skip = filter.skip ?? 0;
    const take = filter.take ?? 20;

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

    const where: Prisma.SightingWhereInput = {
      lostReportId: null,
      status: { in: [SightingStatus.ACTIVE, SightingStatus.FOUND] },
      ...(requireLocation ? { location: { is: locationFilter } } : {}),
      ...(filter.since ? { createdAt: { gte: new Date(filter.since) } } : {}),
    };

    const items = await this.prisma.sighting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: SIGHTING_INCLUDE,
    });

    const nextCursor = items.length === take ? skip + take : null;
    return { items, nextCursor };
  }

  async markFound(id: string, userId: string) {
    return this.changeStatus(id, userId, SightingStatus.FOUND);
  }

  async close(id: string, userId: string) {
    return this.changeStatus(id, userId, SightingStatus.CLOSED);
  }

  private async changeStatus(
    id: string,
    userId: string,
    nextStatus: SightingStatus,
  ) {
    const sighting = await this.prisma.sighting.findUnique({ where: { id } });
    if (!sighting) {
      throw new HttpException('Sighting not found', HttpStatus.NOT_FOUND);
    }
    if (sighting.userId !== userId) {
      throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
    }
    if (sighting.status !== SightingStatus.ACTIVE) {
      throw new HttpException('Sighting is not active', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.sighting.update({
      where: { id },
      data: { status: nextStatus },
      include: SIGHTING_INCLUDE,
    });
  }

  async listMine(userId: string, skip = 0, take = 20) {
    const items = await this.prisma.sighting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: SIGHTING_INCLUDE,
    });
    const nextCursor = items.length === take ? skip + take : null;
    return { items, nextCursor };
  }

  async listByLostReport(lostReportId: string) {
    return this.prisma.sighting.findMany({
      where: { lostReportId },
      orderBy: { createdAt: 'desc' },
      include: SIGHTING_INCLUDE,
    });
  }
}
