import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum PublicSightingStatusFilter {
  ACTIVE = 'active',
  FOUND = 'found',
  ANY = 'any',
}

export class ListPublicSightingsDto {
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
  @IsEnum(PublicSightingStatusFilter)
  status?: PublicSightingStatusFilter;
}
