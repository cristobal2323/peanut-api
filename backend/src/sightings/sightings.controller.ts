import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { SightingsService } from './sightings.service';
import { CreateSightingDto } from './dto/create-sighting.dto';

@Controller('sightings')
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  create(@Body() body: CreateSightingDto, @Headers('accept-language') lang?: string) {
    return this.sightingsService.create(body, lang);
  }
}

@Controller('lost-reports/:id/sightings')
export class LostReportSightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Get()
  listForReport(@Param('id') id: string) {
    return this.sightingsService.listByLostReport(id);
  }
}
