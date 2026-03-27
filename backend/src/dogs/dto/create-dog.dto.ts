import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, IsUUID } from 'class-validator';
import { DogSex, DogSize } from '@prisma/client';

export class CreateDogDto {
  @IsUUID()
  ownerId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  breed?: string;

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
  @IsString()
  color?: string;

  @IsEnum(DogSize)
  size: DogSize;

  @IsOptional()
  @IsString()
  microchip?: string;

  @IsOptional()
  @IsString()
  passportId?: string;
}
