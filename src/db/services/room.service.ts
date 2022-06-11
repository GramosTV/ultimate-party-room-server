import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Room } from '../entities/Room.entity';
import { v4 as uuid } from 'uuid';
@Injectable()
export class RoomService {
  constructor(
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find();
  }
  async createRoom(
    createdAt: string = new Date().toISOString().split('T')[0],
  ): Promise<Room> {
    const newRoom = this.roomRepository.create({ createdAt });
    return this.roomRepository.save(newRoom);
  }
}
