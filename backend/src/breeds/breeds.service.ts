import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const isEn = (lang?: string) => !!lang?.toLowerCase().startsWith('en');

@Injectable()
export class BreedsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q?: string, lang?: string) {
    const english = isEn(lang);

    const breeds = await this.prisma.breed.findMany({
      where: q
        ? {
            OR: [
              { nameEs: { contains: q, mode: 'insensitive' } },
              { nameEn: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: english ? { nameEn: 'asc' } : { nameEs: 'asc' },
    });

    return breeds.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: english ? b.nameEn : b.nameEs,
    }));
  }
}
