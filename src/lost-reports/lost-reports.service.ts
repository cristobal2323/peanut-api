import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LostReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';

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

  async create(payload: CreateLostReportDto) {
    const dog = await this.prisma.dog.findUnique({ where: { id: payload.dogId } });
    if (!dog) {
      throw new HttpException('Dog not found', HttpStatus.BAD_REQUEST);
    }
    if (dog.ownerId !== payload.ownerId) {
      throw new HttpException('Owner mismatch for dog', HttpStatus.BAD_REQUEST);
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

  async getById(id: string) {
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
      throw new HttpException('Lost report not found', HttpStatus.NOT_FOUND);
    }
    return report;
  }
}
