import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { t } from '../i18n/messages';

@Injectable()
export class DogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, payload: CreateDogDto, lang?: string) {
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new HttpException(t(lang, 'OWNER_NOT_FOUND'), HttpStatus.BAD_REQUEST);
    }

    if (payload.breedId) {
      const breed = await this.prisma.breed.findUnique({ where: { id: payload.breedId } });
      if (!breed) {
        throw new HttpException(t(lang, 'BREED_NOT_FOUND'), HttpStatus.BAD_REQUEST);
      }
    }

    if (payload.colorId) {
      const color = await this.prisma.color.findUnique({ where: { id: payload.colorId } });
      if (!color) {
        throw new HttpException(t(lang, 'COLOR_NOT_FOUND'), HttpStatus.BAD_REQUEST);
      }
    }

    return this.prisma.dog.create({
      data: {
        ownerId,
        name: payload.name,
        breedId: payload.breedId,
        mixedBreed: payload.mixedBreed ?? false,
        birthDate: payload.birthDate ? new Date(payload.birthDate) : undefined,
        sex: payload.sex,
        colorId: payload.colorId,
        size: payload.size,
        microchip: payload.microchip,
        passportId: payload.passportId,
        photoUrl: payload.photoUrl,
        notes: payload.notes,
      },
      include: {
        breed: true,
        color: true,
      },
    });
  }

  async getById(id: string, lang?: string) {
    const dog = await this.prisma.dog.findUnique({
      where: { id },
      include: {
        breed: true,
        color: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!dog) {
      throw new HttpException(t(lang, 'DOG_NOT_FOUND'), HttpStatus.NOT_FOUND);
    }

    return dog;
  }

  async listByOwner(ownerId: string) {
    return this.prisma.dog.findMany({
      where: { ownerId },
      include: {
        breed: true,
        color: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, ownerId: string, payload: UpdateDogDto, lang?: string) {
    const dog = await this.prisma.dog.findUnique({ where: { id } });
    if (!dog) {
      throw new HttpException(t(lang, 'DOG_NOT_FOUND'), HttpStatus.NOT_FOUND);
    }
    if (dog.ownerId !== ownerId) {
      throw new HttpException(t(lang, 'OWNER_MISMATCH_FOR_DOG'), HttpStatus.FORBIDDEN);
    }

    if (payload.breedId) {
      const breed = await this.prisma.breed.findUnique({ where: { id: payload.breedId } });
      if (!breed) {
        throw new HttpException(t(lang, 'BREED_NOT_FOUND'), HttpStatus.BAD_REQUEST);
      }
    }

    if (payload.colorId) {
      const color = await this.prisma.color.findUnique({ where: { id: payload.colorId } });
      if (!color) {
        throw new HttpException(t(lang, 'COLOR_NOT_FOUND'), HttpStatus.BAD_REQUEST);
      }
    }

    return this.prisma.dog.update({
      where: { id },
      data: {
        name: payload.name,
        breedId: payload.breedId,
        mixedBreed: payload.mixedBreed,
        birthDate:
          payload.birthDate === undefined
            ? undefined
            : payload.birthDate === null
              ? null
              : new Date(payload.birthDate),
        sex: payload.sex,
        colorId: payload.colorId,
        size: payload.size,
        microchip: payload.microchip,
        passportId: payload.passportId,
        photoUrl: payload.photoUrl,
        notes: payload.notes,
      },
      include: {
        breed: true,
        color: true,
      },
    });
  }

  async remove(id: string, ownerId: string, lang?: string) {
    const dog = await this.prisma.dog.findUnique({ where: { id } });
    if (!dog) {
      throw new HttpException(t(lang, 'DOG_NOT_FOUND'), HttpStatus.NOT_FOUND);
    }
    if (dog.ownerId !== ownerId) {
      throw new HttpException(t(lang, 'OWNER_MISMATCH_FOR_DOG'), HttpStatus.FORBIDDEN);
    }

    await this.prisma.$transaction([
      this.prisma.noseEmbedding.deleteMany({ where: { dogId: id } }),
      this.prisma.appearanceEmbedding.deleteMany({ where: { dogId: id } }),
      this.prisma.identificationResult.deleteMany({ where: { candidateDogId: id } }),
      this.prisma.scanEvent.deleteMany({ where: { dogId: id } }),
      this.prisma.sighting.deleteMany({ where: { dogId: id } }),
      this.prisma.lostReport.deleteMany({ where: { dogId: id } }),
      this.prisma.dog.delete({ where: { id } }),
    ]);

    return { success: true };
  }
}
