import {
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateLostReportDto {
  @IsUUID()
  dogId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsLatitude()
  lastSeenLatitude?: number;

  @IsOptional()
  @IsLongitude()
  lastSeenLongitude?: number;

  @IsOptional()
  @IsString()
  lastSeenAddress?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  lastSeenAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardOffered?: number;
}
