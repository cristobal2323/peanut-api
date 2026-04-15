import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { DogSex, DogSize } from '@prisma/client';

export class UpdateDogDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  breedId?: string;

  @IsOptional()
  @IsBoolean()
  mixedBreed?: boolean;

  @IsOptional()
  @IsISO8601({ strict: true })
  birthDate?: string;

  @IsOptional()
  @IsEnum(DogSex)
  sex?: DogSex;

  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsOptional()
  @IsEnum(DogSize)
  size?: DogSize;

  @IsOptional()
  @IsString()
  microchip?: string;

  @IsOptional()
  @IsString()
  passportId?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
