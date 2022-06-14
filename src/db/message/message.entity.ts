import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Room } from '../room/room.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  text: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line prettier/prettier
  @ManyToOne(type => Room, (room) => room.messages)
  room: Room;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
