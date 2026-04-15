import { Controller, Get, Headers, Query } from '@nestjs/common';
import { BreedsService } from './breeds.service';
import { Public } from '../auth/public.decorator';

@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Public()
  @Get()
  list(@Query('q') q?: string, @Headers('accept-language') lang?: string) {
    return this.breedsService.list(q, lang);
  }
}
