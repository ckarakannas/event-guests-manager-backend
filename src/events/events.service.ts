import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}
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
}
