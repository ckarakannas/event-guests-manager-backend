import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUserId, Public } from '../auth/decorators';
import { JwtGuestsAuthGuard } from '../auth/guards/jwt-guests-auth.guard';
import { PaginationFilter } from '../pagination/dto/pagination.dto';
import { ParsePaginationFilterPipe } from '../pagination/dto/parse-pagination.pipe';
import { CreateGuestDto } from './dto/create-guest.dto';
import { RSVPDto } from './dto/rsvp-dto';
import { Guest } from './entities/guest.entity';
import { GuestsService } from './guests.service';
import { CurrentGuest } from '../auth/decorators/current-guest.decorator';

@Controller('events/:eventId/guests')
@SerializeOptions({ strategy: 'excludeAll' })
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @CurrentUserId() userId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query(new ParsePaginationFilterPipe()) pageFilter: PaginationFilter,
  ) {
    return await this.guestsService.filterGuestsByEventIdAndUserIdPaginated(
      userId,
      eventId,
      {
        total: true,
        currentPage: pageFilter.page,
        limit: 100,
      },
    );
  }

  @Get('search')
  @UseInterceptors(ClassSerializerInterceptor)
  async searchUsersPaginated(
    @CurrentUserId() userId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query(new ParsePaginationFilterPipe()) pageFilter: PaginationFilter,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
  ) {
    return await this.guestsService.filterGuestsByEventIdAndUserIdPaginated(
      userId,
      eventId,
      {
        total: true,
        currentPage: pageFilter.page,
        limit: pageFilter.limit,
      },
      firstName,
      lastName,
    );
  }

  @Public()
  @UseGuards(JwtGuestsAuthGuard)
  @Put('rsvp')
  async guestRSVP(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentGuest() guest: Guest,
    @Body() dto: RSVPDto,
  ) {
    return await this.guestsService.updateRSVPStatus(eventId, dto, guest);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Put(':guestId')
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrUpdate(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('guestId', ParseUUIDPipe) guestId: string,
    @CurrentUserId() userId: string,
    @Body() dto: CreateGuestDto,
  ) {
    const guest =
      (await this.guestsService.findOneByEventIdAndUserId(
        eventId,
        userId,
        guestId,
      )) ?? new Guest();
    return this.guestsService.createOrUpdate(eventId, dto, guest);
  }

  @Delete(':guestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('guestId', ParseUUIDPipe) guestId: string,
    @CurrentUserId() userId: string,
  ) {
    const guest = await this.guestsService.findOneByEventIdAndUserId(
      eventId,
      userId,
      guestId,
    );

    if (!guest) {
      throw new NotFoundException(
        'Operation failed. Guest not found or you are not authorized to change this event!',
      );
    }
    return await this.guestsService.deleteGuest(guest);
  }
}
