import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { RecoverPasswordDto } from "./dto/recover-password.dto";

@Injectable()
export class UsersService {
  private readonly jwtExpiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  private sanitizeUser<T extends { passwordHash?: string }>(user: T) {
    // Hide sensitive password hash before returning outward
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private async generateToken(user: {
    id: string;
    email: string;
    role: UserRole;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtExpiresIn,
    });
    return { token, expiresIn: this.jwtExpiresIn };
  }

  async signup(payload: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw new HttpException("Email already registered", HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        passwordHash,
        role: UserRole.OWNER,
      },
    });

    return this.sanitizeUser(user);
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const auth = await this.generateToken(user);

    return {
      ...auth,
      user: this.sanitizeUser(user),
    };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        dogs: true,
      },
    });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }

  async recoverPassword(payload: RecoverPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const newPassword = crypto.randomBytes(4).toString("hex");
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.mailService.sendPasswordReset(
      user.email,
      newPassword,
      user.name
    );

    return { message: "Password reset email sent" };
  }
}
