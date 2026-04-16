import { IsLatitude, IsLongitude, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSightingDto {
  @IsOptional()
  @IsUUID()
  dogId?: string;

  @IsOptional()
  @IsUUID()
  lostReportId?: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  addressText?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
