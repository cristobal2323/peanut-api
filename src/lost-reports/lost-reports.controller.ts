import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LostReportsService } from './lost-reports.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';

@Controller('lost-reports')
export class LostReportsController {
  constructor(private readonly lostReportsService: LostReportsService) {}

  @Post()
  create(@Body() body: CreateLostReportDto) {
    return this.lostReportsService.create(body);
  }

  @Get('active')
  getActive() {
    return this.lostReportsService.getActive();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.lostReportsService.getById(id);
  }
}
