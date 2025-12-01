import { Module } from '@nestjs/common';
import { ScanEventsService } from './scan-events.service';
import { ScanEventsController } from './scan-events.controller';

@Module({
  controllers: [ScanEventsController],
  providers: [ScanEventsService],
  exports: [ScanEventsService],
})
export class ScanEventsModule {}
