import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LostReportsService } from './lost-reports.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';
import { ListPublicLostReportsDto } from './dto/list-public-lost-reports.dto';

type AuthedRequest = Request & { user: { sub: string; email?: string; role?: string } };

@Controller('lost-reports')
export class LostReportsController {
  constructor(private readonly lostReportsService: LostReportsService) {}

  @Post()
  create(
    @Body() body: CreateLostReportDto,
    @Req() req: AuthedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    return this.lostReportsService.create(req.user.sub, body, lang);
  }

  @Get('active')
  getActive() {
    return this.lostReportsService.getActive();
  }

  @Get('public')
  listPublic(@Query() query: ListPublicLostReportsDto) {
    return this.lostReportsService.listPublic(query);
  }

  @Get('mine')
  listMine(
    @Req() req: AuthedRequest,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.lostReportsService.listByOwner(
      req.user.sub,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('accept-language') lang?: string) {
    return this.lostReportsService.getById(id, lang);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    return this.lostReportsService.resolve(id, req.user.sub, lang);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    return this.lostReportsService.cancel(id, req.user.sub, lang);
  }
}
