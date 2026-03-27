import { Injectable } from '@nestjs/common';
import { ScanMode, ScanStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScanEventDto } from './dto/create-scan-event.dto';

@Injectable()
export class ScanEventsService {
  constructor(private readonly prisma: PrismaService) {}

  private async createLocation(latitude?: number, longitude?: number) {
    if (latitude === undefined || longitude === undefined) {
      return null;
    }
    return this.prisma.location.create({
      data: {
        latitude,
        longitude,
      },
    });
  }

  async create(payload: CreateScanEventDto) {
    const media = await this.prisma.media.create({
      data: {
        url: payload.imageUrl,
        type: 'image',
        source: 'scan',
        createdByUserId: payload.userId,
      },
    });

    const location = await this.createLocation(payload.latitude, payload.longitude);

    return this.prisma.scanEvent.create({
      data: {
        userId: payload.userId,
        mode: payload.mode as ScanMode,
        imageId: media.id,
        locationId: location?.id,
        status: ScanStatus.PENDING,
      },
      include: {
        image: true,
        location: true,
        results: {
          include: {
            candidateDog: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    return this.prisma.scanEvent.findUnique({
      where: { id },
      include: {
        image: true,
        location: true,
        results: {
          orderBy: { rank: 'asc' },
          include: {
            candidateDog: true,
          },
        },
      },
    });
  }
}
