import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { t } from '../i18n/messages';

@Injectable()
export class SightingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateSightingDto, lang?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new HttpException(t(lang, 'USER_NOT_FOUND'), HttpStatus.BAD_REQUEST);
    }

    const location = await this.prisma.location.create({
      data: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
    });

    const media = payload.imageUrl
      ? await this.prisma.media.create({
          data: {
            url: payload.imageUrl,
            type: 'image',
            source: 'user_upload',
            createdByUserId: payload.userId,
          },
        })
      : null;

    return this.prisma.sighting.create({
      data: {
        userId: payload.userId,
        dogId: payload.dogId,
        lostReportId: payload.lostReportId,
        locationId: location.id,
        imageId: media?.id,
        notes: payload.notes,
      },
      include: {
        location: true,
        image: true,
        user: { select: { id: true, name: true } },
        dog: true,
      },
    });
  }

  async listByLostReport(lostReportId: string) {
    return this.prisma.sighting.findMany({
      where: { lostReportId },
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        image: true,
        user: { select: { id: true, name: true } },
        dog: true,
      },
    });
  }
}
