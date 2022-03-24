import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { Guest } from '../guests/entities/guest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Guest])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
