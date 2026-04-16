import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LostReportStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';
import { t } from '../i18n/messages';

type Tx = Prisma.TransactionClient;

@Injectable()
export class LostReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, payload: CreateLostReportDto, lang?: string) {
    return this.prisma.$transaction(async (tx: Tx) => {
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
  }

  async listByOwner(ownerId: string) {
    return this.prisma.lostReport.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        dog: { include: { breed: true, color: true } },
        lastSeenLocation: true,
      },
    });
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

    return this.prisma.$transaction(async (tx: Tx) => {
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
  }
}
