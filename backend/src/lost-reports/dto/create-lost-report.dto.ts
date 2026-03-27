import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLostReportDto {
  @IsUUID()
  dogId: string;

  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  lastSeenLatitude?: number;

  @IsOptional()
  @IsNumber()
  lastSeenLongitude?: number;

  @IsOptional()
  @IsNumber()
  rewardOffered?: number;
}
