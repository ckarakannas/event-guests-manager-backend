import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, PaginatedEvents } from './entities/event.entity';
import { GuestRSVPEnum } from '../guests/entities/guest-rsvp.enum';
import { paginate, PaginateOptions } from '../pagination/paginator';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  private getEventsBaseQuery(userId: string): SelectQueryBuilder<Event> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .where('e.organizerId = :userId', { userId })
      .orderBy('e.when', 'DESC');
  }

  private getEventWithGuestCountQuery(
    userId: string,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery(userId)
      .loadRelationCountAndMap('e.guestsCount', 'e.guests')
      .loadRelationCountAndMap('e.guestsAccepted', 'e.guests', 'guest', (qb) =>
        qb.where('guest.rsvpStatus = :answer', {
          answer: GuestRSVPEnum.Accepted,
        }),
      )
      .loadRelationCountAndMap('e.guestsPending', 'e.guests', 'guest', (qb) =>
        qb.where('guest.rsvpStatus = :answer', {
          answer: GuestRSVPEnum.Pending,
        }),
      )
      .loadRelationCountAndMap('e.guestRejected', 'e.guests', 'guest', (qb) =>
        qb.where('guest.rsvpStatus = :answer', {
          answer: GuestRSVPEnum.Rejected,
        }),
      );
  }

  public async getEventsWithAttendeeCountPaginated(
    userId: string,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      this.getEventWithGuestCountQuery(userId),
      paginateOptions,
    );
  }

  async getEvent(id: string, userId: string): Promise<Event | undefined> {
    const query = this.getEventWithGuestCountQuery(userId).andWhere(
      'e.id = :id',
      { id },
    );
    this.logger.debug(query.getSql());
    return await query.getOne();
  }

  async create(
    createEventDto: CreateEventDto,
    user: User,
  ): Promise<Event | undefined> {
    return await this.eventsRepository.save(
      new Event({
        ...createEventDto,
        organizer: user,
        when: new Date(createEventDto.when),
      }),
    );
  }

  async getEvents(organizerId: string): Promise<Event[] | undefined> {
    return await this.eventsRepository.find({
      where: [{ organizerId: organizerId }],
      relations: ['guests', 'organizer'],
      // select: ['name', 'id'],
    });
  }

  async findOne(id: string, organizerId: string): Promise<Event> | undefined {
    return await this.eventsRepository.findOne({
      where: [{ id: id, organizerId: organizerId }],
      relations: ['guests', 'organizer'],
    });
  }

  async findByName(
    eventName: string,
    organizerId: string,
  ): Promise<Event> | undefined {
    return await this.eventsRepository.findOne({
      where: [{ name: eventName, organizerId: organizerId }],
    });
  }

  async updateEvent(
    event: Event,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...event,
        ...updateEventDto,
        when: updateEventDto.when ? new Date(updateEventDto.when) : event.when,
      }),
    );
  }

  async deleteEvent(id: string) {
    return await this.eventsRepository.delete({
      id: id,
    });
  }

  async deleteEventWithQB(id: string, userId: string): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where({ id: id, organizerId: userId })
      .execute();
  }
}
