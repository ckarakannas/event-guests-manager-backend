import { Expose } from 'class-transformer';
import { Event } from './event.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Event, (event) => event.guests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  event: Event;
}
