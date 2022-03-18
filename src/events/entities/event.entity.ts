import { Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guest } from './guest.entity';

@Entity()
export class Event {
  constructor(partialEvent?: Partial<Event>) {
    Object.assign(this, partialEvent);
  }
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  when: Date;

  @Column()
  @Expose()
  address: string;

  @OneToMany(() => Guest, (guest) => guest.event, {
    cascade: ['insert', 'update'],
  })
  @Expose()
  guests: Guest[];

  @ManyToOne(() => User, (user) => user.organizedEvents)
  @Expose()
  organizer: User;

  @Column({ nullable: true })
  organizerId: number;

  @Expose()
  attendeeCount?: number;
  @Expose()
  attendeeRejected?: number;
  @Expose()
  attendeeMaybe?: number;
  @Expose()
  attendeeAccepted?: number;
}
