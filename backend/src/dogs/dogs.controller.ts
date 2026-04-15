import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DogsService } from './dogs.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';

type AuthedRequest = Request & { user: { sub: string; email?: string; role?: string } };

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post()
  create(
    @Body() body: CreateDogDto,
    @Req() req: AuthedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    return this.dogsService.create(req.user.sub, body, lang);
  }

  @Get()
  listMine(@Req() req: AuthedRequest) {
    return this.dogsService.listByOwner(req.user.sub);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('accept-language') lang?: string) {
    return this.dogsService.getById(id, lang);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateDogDto,
    @Req() req: AuthedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    return this.dogsService.update(id, req.user.sub, body, lang);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    return this.dogsService.remove(id, req.user.sub, lang);
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
