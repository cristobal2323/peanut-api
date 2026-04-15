import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const isEn = (lang?: string) => !!lang?.toLowerCase().startsWith('en');

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q?: string, lang?: string) {
    const english = isEn(lang);

    const colors = await this.prisma.color.findMany({
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

    return colors.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: english ? c.nameEn : c.nameEs,
      hex: c.hex,
    }));
  }
}
