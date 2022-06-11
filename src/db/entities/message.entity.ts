import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column()
  userId: string;

  @Column()
  roomId: string;
}
