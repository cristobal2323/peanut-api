import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DogsService } from './dogs.service';
import { CreateDogDto } from './dto/create-dog.dto';

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post()
  create(@Body() body: CreateDogDto) {
    return this.dogsService.create(body);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.dogsService.getById(id);
  }
}

@Controller('users/:userId/dogs')
export class UserDogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Get()
  list(@Param('userId') userId: string) {
    return this.dogsService.listByOwner(userId);
  }
}
