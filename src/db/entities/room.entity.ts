import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 25 })
  roomId: string;

  @Column()
  createdAt: Date;
}
