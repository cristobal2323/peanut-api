import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { SightingsService } from './sightings.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { ListPublicSightingsDto } from './dto/list-public-sightings.dto';

@Controller('sightings')
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  create(@Body() body: CreateSightingDto, @Req() req: any) {
    return this.sightingsService.create(req.user.sub, body);
  }

  @Get('public')
  listPublic(@Query() query: ListPublicSightingsDto) {
    return this.sightingsService.listPublic(query);
  }

  @Post(':id/found')
  markFound(@Param('id') id: string, @Req() req: any) {
    return this.sightingsService.markFound(id, req.user.sub);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Req() req: any) {
    return this.sightingsService.close(id, req.user.sub);
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
