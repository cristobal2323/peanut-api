import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
