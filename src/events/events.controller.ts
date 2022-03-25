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
  BadRequestException,
  UseGuards,
  SerializeOptions,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@SerializeOptions({ strategy: 'excludeAll' })
@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.findByName(
      createEventDto.name,
      user.id,
    );

    if (event) {
      throw new BadRequestException(
        `Event ${createEventDto.name} already exists!`,
      );
    }

    return await this.eventsService.create(createEventDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getEvents(@CurrentUser() user: User) {
    return await this.eventsService.getEvents(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.getEvent(id, user.id);
    if (!event) {
      throw new NotFoundException(
        'Event not found or your are not authorized to view this event!',
      );
    }
    return event;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.findOne(id, user.id);

    if (!event) {
      throw new NotFoundException(
        'Operation failed. Event not found or you are not authorized to change this event!',
      );
    }

    return await this.eventsService.updateEvent(event, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.findOne(id, user.id);

    if (!event) {
      throw new NotFoundException(
        'Operation failed. Event not found or you are not authorized to change this event!',
      );
    }
    return await this.eventsService.deleteEvent(id);
  }
}
