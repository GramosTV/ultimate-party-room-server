import { Message } from './message.entity';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DeleteResult, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';
import { Room } from '../room/room.entity';
import { RoomService } from '../room/room.service';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @Inject(forwardRef(() => RoomService)) private roomService: RoomService,
  ) {}

  async deleteAll(): Promise<DeleteResult> {
    const res = await this.messageRepository.delete({
      id: Like('%%')
    });
    return res;
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 30,
    });
  }

  async findAllWithRoomId(id: string): Promise<Message[]> {
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
  ): Promise<Message> {
    const room = await this.roomService.findOne(roomId);
    const newMessage = this.messageRepository.create({
      name,
      text,
      room,
    });
    return this.messageRepository.save(newMessage);
  }
  async delete(id: string) {
    const deleteUserResult = this.messageRepository.delete({
      id,
    });
    return deleteUserResult;
  }
}
