import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeUser<T extends { passwordHash?: string }>(user: T) {
    // Hide sensitive password hash before returning outward
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async signup(payload: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: UserRole.OWNER,
      },
    });

    return this.sanitizeUser(user);
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        dogs: true,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }
}
