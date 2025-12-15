import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { t } from '../i18n/messages';

@Injectable()
export class DogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateDogDto, lang?: string) {
    const owner = await this.prisma.user.findUnique({ where: { id: payload.ownerId } });
    if (!owner) {
      throw new HttpException(t(lang, 'OWNER_NOT_FOUND'), HttpStatus.BAD_REQUEST);
    }

    return this.prisma.dog.create({
      data: {
        ownerId: payload.ownerId,
        name: payload.name,
        breed: payload.breed,
        mixedBreed: payload.mixedBreed ?? false,
        ageYears: payload.ageYears,
        sex: payload.sex,
        color: payload.color,
        size: payload.size,
        microchip: payload.microchip,
        passportId: payload.passportId,
      },
    });
  }

  async getById(id: string, lang?: string) {
    const dog = await this.prisma.dog.findUnique({
      where: { id },
      include: {
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
    return this.prisma.dog.findMany({ where: { ownerId } });
  }
}
