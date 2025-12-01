import { Module } from '@nestjs/common';
import { SightingsService } from './sightings.service';
import { LostReportSightingsController, SightingsController } from './sightings.controller';

@Module({
  controllers: [SightingsController, LostReportSightingsController],
  providers: [SightingsService],
  exports: [SightingsService],
})
export class SightingsModule {}
