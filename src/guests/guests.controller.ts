import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Controller('events/:eventId/guests')
@SerializeOptions({ strategy: 'excludeAll' })
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return await this.guestsService.findByEventId(eventId);
  }
}
