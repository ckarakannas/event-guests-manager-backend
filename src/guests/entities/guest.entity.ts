import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { GuestRSVPEnum } from './guest-rsvp.enum';

@Entity()
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Event, (event) => event.guests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  event: Event;

  @Column('enum', { enum: GuestRSVPEnum })
  rsvpStatus: GuestRSVPEnum;
}
