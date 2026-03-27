import { Module } from '@nestjs/common';
import { DogsService } from './dogs.service';
import { DogsController, UserDogsController } from './dogs.controller';

@Module({
  controllers: [DogsController, UserDogsController],
  providers: [DogsService],
  exports: [DogsService],
})
export class DogsModule {}
