import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  async create(createEventDto: CreateEventDto): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...createEventDto,
        when: new Date(),
      }),
    );
  }

  async getEvents() {
    return await this.eventsRepository.find({
      select: ['name', 'id'],
    });
  }

  async findOne(id: number): Promise<Event> | undefined {
    return await this.eventsRepository.findOne(id, {
      relations: ['guests'],
    });
  }

  async findByName(name: string) {
    return await `This action returns a #${name} event`;
  }

  async updateEvent(event: Event, input: UpdateEventDto): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...event,
        ...input,
        when: input.when ? new Date(input.when) : event.when,
      }),
    );
  }

  async deleteEvent(id: number) {
    return await this.eventsRepository.delete({
      id: id,
    });
  }
}
