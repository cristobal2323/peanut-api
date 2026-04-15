import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { DogSex, DogSize } from '@prisma/client';

export class CreateDogDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  breedId?: string;

  @IsOptional()
  @IsBoolean()
  mixedBreed?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  ageYears?: number;

  @IsEnum(DogSex)
  sex: DogSex;

  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsEnum(DogSize)
  size: DogSize;

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
