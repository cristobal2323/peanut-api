import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SightingsService } from './sightings.service';
import { CreateSightingDto } from './dto/create-sighting.dto';

@Controller('sightings')
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  create(@Body() body: CreateSightingDto) {
    return this.sightingsService.create(body);
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
