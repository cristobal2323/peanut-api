import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { LostReportsService } from './lost-reports.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';

@Controller('lost-reports')
export class LostReportsController {
  constructor(private readonly lostReportsService: LostReportsService) {}

  @Post()
  create(@Body() body: CreateLostReportDto, @Headers('accept-language') lang?: string) {
    return this.lostReportsService.create(body, lang);
  }

  @Get('active')
  getActive() {
    return this.lostReportsService.getActive();
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('accept-language') lang?: string) {
    return this.lostReportsService.getById(id, lang);
  }
}
