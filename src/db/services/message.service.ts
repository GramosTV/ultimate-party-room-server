import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from '../entities/Message.entity';
@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_REPOSITORY')
    private messageRepository: Repository<Message>,
  ) {}

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }
  async createMessage(
    text: string,
    userId: string,
    roomId: string,
    createdAt: string = new Date().toJSON().slice(0, 19).replace('T', ' '),
  ): Promise<Message> {
    const newMessage = this.messageRepository.create({
      text,
      createdAt,
      userId,
      roomId,
    });
    return this.messageRepository.save(newMessage);
  }
}
