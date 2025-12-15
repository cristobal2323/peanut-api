import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @Public()
  signup(@Body() body: SignupDto, @Headers('accept-language') lang?: string) {
    return this.usersService.signup(body, lang);
  }

  @Post('login')
  @Public()
  login(@Body() body: LoginDto, @Headers('accept-language') lang?: string) {
    return this.usersService.login(body, lang);
  }

  @Post('refresh')
  @Public()
  refresh(@Body() body: RefreshTokenDto, @Headers('accept-language') lang?: string) {
    return this.usersService.refresh(body.refreshToken, lang);
  }

  @Post('recover-password')
  @Public()
  recoverPassword(
    @Body() body: RecoverPasswordDto,
    @Headers('accept-language') lang?: string
  ) {
    return this.usersService.recoverPassword(body, lang);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('accept-language') lang?: string) {
    return this.usersService.getById(id, lang);
  }
}
