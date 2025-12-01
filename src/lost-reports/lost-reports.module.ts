import { Module } from '@nestjs/common';
import { LostReportsService } from './lost-reports.service';
import { LostReportsController } from './lost-reports.controller';

@Module({
  controllers: [LostReportsController],
  providers: [LostReportsService],
  exports: [LostReportsService],
})
export class LostReportsModule {}
