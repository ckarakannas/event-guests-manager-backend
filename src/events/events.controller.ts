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
  SerializeOptions,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationFilter } from '../pagination/dto/pagination.dto';
import { ParsePaginationFilterPipe } from '../pagination/dto/parse-pagination.pipe';
import { CurrentUserId } from '../auth/decorators';

@SerializeOptions({ strategy: 'excludeAll' })
@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUserId() userId: string,
  ) {
    const event = await this.eventsService.findByName(
      createEventDto.name,
      userId,
    );

    if (event) {
      throw new BadRequestException(
        `Event ${createEventDto.name} already exists!`,
      );
    }
    return await this.eventsService.create(createEventDto, userId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getEvents(
    @Query(new ParsePaginationFilterPipe()) filter: PaginationFilter,
    @CurrentUserId() userId: string,
  ) {
    return await this.eventsService.getEventsWithAttendeeCountPaginated(
      userId,
      {
        total: true,
        currentPage: filter.page,
        limit: filter.limit,
      },
    );
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUserId() userId: string,
  ) {
    const event = await this.eventsService.getEvent(id, userId);
    if (!event) {
      throw new NotFoundException(
        'Event not found or your are not authorized to view this event!',
      );
    }
    return event;
  }

  @Patch(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUserId() userId: string,
  ) {
    const event = await this.eventsService.findOne(id, userId);

    if (!event) {
      throw new NotFoundException(
        'Operation failed. Event not found or you are not authorized to change this event!',
      );
    }

    return await this.eventsService.updateEvent(event, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.eventsService.deleteEventWithQB(id, userId);

    if (result?.affected !== 1) {
      throw new NotFoundException(
        'Operation failed. Event not found or you are not authorized to change this event!',
      );
    }
  }
}
