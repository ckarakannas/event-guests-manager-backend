import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { Guest, PaginatedGuests } from './entities/guest.entity';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestsRepository: Repository<Guest>,
  ) {}

  // Have to think how to get event corresponding to current user
  private getEventsBaseQuery(userId: string): SelectQueryBuilder<Guest> {
    return this.guestsRepository
      .createQueryBuilder('g')
      .where('g.organizerId = :userId', { userId })
      .orderBy('e.when', 'DESC');
  }
  
  async findByEventId(eventId: string): Promise<Guest[]> {
    return await this.guestsRepository.find({ event : {id: eventId}})
  }

  async findByEventIdPaginated(eventId: string): Promise<PaginatedGuests | undefined> {
    return undefined
  }
}
