import { Expose } from 'class-transformer';
import { PaginationResult } from '../../pagination/paginator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { GuestRSVPEnum } from './guest-rsvp.enum';

@Entity()
@Unique(['eventId', 'firstName', 'lastName'])
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  firstName: string;

  @Column()
  @Expose()
  lastName: string;

  @Column({ nullable: true })
  @Expose()
  email: string;

  @ManyToOne(() => Event, (event) => event.guests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  event: Event;

  @Column()
  eventId: string;

  @Column('enum', { enum: GuestRSVPEnum, nullable: true })
  @Expose()
  rsvpStatus: GuestRSVPEnum;
}

export type PaginatedGuests = PaginationResult<Guest>;
