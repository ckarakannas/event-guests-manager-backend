import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateOptions } from '../pagination/paginator';
import { DeleteQueryBuilder, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateGuestDto } from './dto/create-guest.dto';
import { Guest, PaginatedGuests } from './entities/guest.entity';
import { RSVPDto } from './dto/rsvp-dto';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestsRepository: Repository<Guest>,
  ) {}

  private getGuestsBaseQuery(eventId: string): SelectQueryBuilder<Guest> {
    return this.guestsRepository
      .createQueryBuilder('g')
      .where('g.eventId = :eventId', { eventId })
      .orderBy({ 'g.firstName': 'ASC', 'g.lastName': 'ASC' });
  }

  private getGuestsByUserIdQuery(
    eventId: string,
    userId: string,
  ): SelectQueryBuilder<Guest> {
    return this.getGuestsBaseQuery(eventId)
      .innerJoinAndSelect('g.event', 'e')
      .andWhere('e.organizerId = :userId', { userId });
  }

  async findOneByEventIdAndUserId(
    eventId: string,
    userId: string,
    guestId: string,
  ): Promise<Guest | undefined> {
    return await this.getGuestsByUserIdQuery(eventId, userId)
      .andWhere('g.id = :guestId', { guestId })
      .getOne();
  }

  async findById(guestId: string): Promise<Guest | undefined> {
    return await this.guestsRepository.findOne(guestId);
  }

  async filterGuestsByEventIdAndUserIdPaginated(
    userId: string,
    eventId: string,
    paginateOptions: PaginateOptions,
    firstNameFilter?: string,
    lastNameFilter?: string,
  ): Promise<PaginatedGuests | undefined> {
    const qb = this.getGuestsByUserIdQuery(eventId, userId);
    if (firstNameFilter) {
      qb.andWhere('g.firstName ILIKE :firstName', {
        firstName: `%${firstNameFilter}%`,
      });
    }
    if (lastNameFilter) {
      qb.andWhere('g.lastName ILIKE :lastName', {
        lastName: `%${lastNameFilter}%`,
      });
    }
    return await paginate(qb, paginateOptions);
  }

  async createOrUpdate(
    eventId: string,
    dto: CreateGuestDto,
    guest: Guest,
  ): Promise<Guest> {
    guest.firstName = dto.firstName;
    guest.lastName = dto.lastName;
    guest.eventId = eventId;
    guest.email = dto.email ?? guest.email;
    guest.rsvpStatus = dto.rsvpStatus ?? guest.rsvpStatus;
    return await this.guestsRepository.save(guest);
  }

  async updateRSVPStatus(
    eventId: string,
    dto: RSVPDto,
    guest: Guest,
  ): Promise<Guest> {
    guest.eventId = eventId;
    guest.rsvpStatus = dto.rsvpStatus;
    return await this.guestsRepository.save(guest);
  }

  async deleteGuest(guest: Guest): Promise<Guest> {
    return await this.guestsRepository.remove(guest);
  }
}
