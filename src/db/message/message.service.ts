import { Message } from './message.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Room } from '../room/room.entity';
import { RoomService } from '../room/room.service';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @Inject(RoomService) private roomService: RoomService,
  ) {}

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }
  async findAllWithId(id: string): Promise<Message[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.room', 'room')
      .where('message.room.id = :roomId', { roomId: id })
      .getMany();
    return messages;
  }
  async createMessage(
    name: string,
    text: string,
    roomId: string,
    createdAt: string = new Date().toJSON().slice(0, 19).replace('T', ' '),
  ): Promise<Message> {
    const room = await this.roomService.findOne(roomId);
    const newMessage = this.messageRepository.create({
      name,
      text,
      room,
      createdAt,
    });
    return this.messageRepository.save(newMessage);
  }
}
