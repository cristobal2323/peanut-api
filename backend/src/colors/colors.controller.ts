import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { Public } from '../auth/public.decorator';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Public()
  @Get()
  list(@Query('q') q?: string, @Headers('accept-language') lang?: string) {
    return this.colorsService.list(q, lang);
  }
}
