import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: string;

  @IsOptional()
  @IsString()
  @IsIn(['es', 'en'])
  locale?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
