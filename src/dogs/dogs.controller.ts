import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { DogsService } from './dogs.service';
import { CreateDogDto } from './dto/create-dog.dto';

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post()
  create(@Body() body: CreateDogDto, @Headers('accept-language') lang?: string) {
    return this.dogsService.create(body, lang);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('accept-language') lang?: string) {
    return this.dogsService.getById(id, lang);
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
