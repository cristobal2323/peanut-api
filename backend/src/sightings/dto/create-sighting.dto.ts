import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSightingDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  dogId?: string;

  @IsOptional()
  @IsUUID()
  lostReportId?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
