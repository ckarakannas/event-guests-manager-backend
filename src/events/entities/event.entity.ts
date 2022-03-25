import { Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guest } from '../../guests/entities/guest.entity';

@Entity()
export class Event {
  constructor(partialEvent?: Partial<Event>) {
    Object.assign(this, partialEvent);
  }
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  name: string;

  @Column({ nullable: true })
  @Expose()
  type: string;

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
  organizerId: string;

  @Expose()
  guestsCount?: number;

  @Expose()
  guestsAccepted?: number;

  @Expose()
  guestsRejected?: number;

  @Expose()
  guestsPending?: number;
}
