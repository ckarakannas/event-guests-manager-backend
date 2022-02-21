import {
  Controller,
  Logger,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryFailedError } from 'typeorm';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService
      .create(createEventDto)
      .catch((error: any) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('duplicate')
        ) {
          throw new BadRequestException('Event already exists!');
        } else {
          throw new InternalServerErrorException();
        }
      });
  }

  @Get()
  async getEvents() {
    return await this.eventsService.getEvents();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.eventsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.findOne(+id);

    if (!event) {
      throw new NotFoundException(null, 'Operation failed. Event not found!');
    }

    // if (event.organizerId !== user.id) {
    //   throw new ForbiddenException(
    //     null, `You are not authorized to change this event`
    //   );
    // }

    return await this.eventsService
      .updateEvent(event, updateEventDto)
      .catch((error: any) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('duplicate')
        ) {
          throw new BadRequestException(
            'Event name already exists! Choose a different name.',
          );
        } else {
          throw new InternalServerErrorException();
        }
      });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.eventsService.deleteEvent(+id);
  }
}
