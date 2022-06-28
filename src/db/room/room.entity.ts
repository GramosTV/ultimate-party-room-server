import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VideoState } from 'types';
import { Message } from '../message/message.entity';
import { User } from '../user/user.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ length: 100 })
  videoUrl: string;

  @Column({ type: 'decimal', precision: 20, scale: 19, default: 0 })
  videoMoment: number;

  @Column()
  videoState: VideoState;

  @Column({ length: 65535 })
  canvas: string;

  @Column()
  canvasBgc: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line prettier/prettier
  @OneToMany(type => Message, (message) => message.room, {
    onDelete: "CASCADE"
})
  messages: Message[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line prettier/prettier
  @OneToMany(type => User, (user) => user.room, {
    onDelete: "CASCADE"
})
  users: User[];
}
