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
  ValidationPipe,
  UsePipes,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationFilter } from '../pagination/dto/pagination.dto';
import { ParsePaginationFilterPipe } from 'src/pagination/dto/parse-pagination.pipe';

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
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getEvents(
    @Query(new ParsePaginationFilterPipe()) filter: PaginationFilter,
    @CurrentUser() user: User,
  ) {
    return await this.eventsService.getEventsWithAttendeeCountPaginated(
      user.id,
      {
        total: true,
        currentPage: filter.page,
        limit: filter.limit,
      },
    );
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
