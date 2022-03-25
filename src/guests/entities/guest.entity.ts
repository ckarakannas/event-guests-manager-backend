import { Expose } from 'class-transformer';
import { PaginationResult } from '../../pagination/paginator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { GuestRSVPEnum } from './guest-rsvp.enum';

@Entity()
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Event, (event) => event.guests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  event: Event;

  @Column()
  eventId: number;

  @Column('enum', { enum: GuestRSVPEnum })
  @Expose()
  rsvpStatus: GuestRSVPEnum;
}

export type PaginatedGuests = PaginationResult<Guest>;