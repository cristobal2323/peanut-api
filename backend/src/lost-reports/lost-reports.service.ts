import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LostReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';
import { t } from '../i18n/messages';

@Injectable()
export class LostReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveLocation(latitude?: number, longitude?: number) {
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

  async create(payload: CreateLostReportDto, lang?: string) {
    const dog = await this.prisma.dog.findUnique({ where: { id: payload.dogId } });
    if (!dog) {
      throw new HttpException(t(lang, 'DOG_NOT_FOUND'), HttpStatus.BAD_REQUEST);
    }
    if (dog.ownerId !== payload.ownerId) {
      throw new HttpException(t(lang, 'OWNER_MISMATCH_FOR_DOG'), HttpStatus.BAD_REQUEST);
    }

    const location = await this.resolveLocation(payload.lastSeenLatitude, payload.lastSeenLongitude);

    return this.prisma.lostReport.create({
      data: {
        dogId: payload.dogId,
        ownerId: payload.ownerId,
        description: payload.description,
        lastSeenLocationId: location?.id,
        lastSeenAt: location ? new Date() : undefined,
        status: LostReportStatus.ACTIVE,
        rewardOffered: payload.rewardOffered,
      },
      include: {
        dog: true,
        owner: true,
        lastSeenLocation: true,
      },
    });
  }

  async getActive() {
    return this.prisma.lostReport.findMany({
      where: { status: LostReportStatus.ACTIVE },
      include: {
        dog: true,
        owner: true,
        lastSeenLocation: true,
      },
    });
  }

  async getById(id: string, lang?: string) {
    const report = await this.prisma.lostReport.findUnique({
      where: { id },
      include: {
        dog: true,
        owner: true,
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
}
