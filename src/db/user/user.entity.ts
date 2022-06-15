import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Room } from '../room/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  clientId: string;

  @Column()
  profilePicture: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line prettier/prettier
  @ManyToOne(type => Room, (room) => room.users)
  room: Room;
}
