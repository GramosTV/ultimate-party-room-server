import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Message } from '../message/message.entity';
import { User } from '../user/user.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  createdAt: Date;

  @Column({ length: 100 })
  videoUrl: string;

  @Column({ type: 'decimal', precision: 20, scale: 19, default: 0 })
  videoMoment: number;

  @Column({ length: 65535 })
  canvas: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line prettier/prettier
  @OneToMany(type => Message, (message) => message.room)
  messages: Message[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line prettier/prettier
  @OneToMany(type => User, (user) => user.room)
  users: User[];
}
