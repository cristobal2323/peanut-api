import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';

export const SIGNUP_ROLES = ['OWNER', 'RESCUER', 'VET'] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export class SignupDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @Matches(/^\+?\d{7,15}$/, { message: 'Phone must include country code and digits only' })
  phone: string;

  @IsOptional()
  @IsEnum(SIGNUP_ROLES, { message: 'Role must be one of OWNER, RESCUER, VET' })
  role?: SignupRole;
}
