import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ScanMode } from '@prisma/client';

export class CreateScanEventDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  imageUrl: string;

  @IsEnum(ScanMode)
  mode: ScanMode;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
