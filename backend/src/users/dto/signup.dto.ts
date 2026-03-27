import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @Matches(/^\+?\d{7,15}$/, { message: 'Phone must include country code and digits only' })
  phone: string;
}
