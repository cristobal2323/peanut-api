import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsISO8601,
} from 'class-validator';

export enum PublicStatusFilter {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ANY = 'any',
}

export class ListPublicLostReportsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  take?: number;

  @IsOptional()
  @IsEnum(PublicStatusFilter)
  status?: PublicStatusFilter;

  @IsOptional()
  @IsUUID()
  breedId?: string;

  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  minLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  maxLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  minLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  maxLng?: number;

  @IsOptional()
  @IsISO8601({ strict: true })
  since?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
