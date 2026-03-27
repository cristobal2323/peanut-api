import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScanEventsService } from './scan-events.service';
import { CreateScanEventDto } from './dto/create-scan-event.dto';

@Controller('scan-events')
export class ScanEventsController {
  constructor(private readonly scanEventsService: ScanEventsService) {}

  @Post()
  create(@Body() body: CreateScanEventDto) {
    return this.scanEventsService.create(body);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.scanEventsService.getById(id);
  }
}
