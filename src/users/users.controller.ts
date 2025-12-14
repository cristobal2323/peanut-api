import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @Public()
  signup(@Body() body: SignupDto) {
    return this.usersService.signup(body);
  }

  @Post('login')
  @Public()
  login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Post('recover-password')
  @Public()
  recoverPassword(@Body() body: RecoverPasswordDto) {
    return this.usersService.recoverPassword(body);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }
}
