import { Message } from './../entities/message.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }
  async findAllWithId(id: string): Promise<Message[]> {
    return this.messageRepository.find({ where: { id } });
  }
  async createMessage(
    name: string,
    text: string,
    roomId: string,
    createdAt: string = new Date().toJSON().slice(0, 19).replace('T', ' '),
  ): Promise<Message> {
    const newMessage = this.messageRepository.create({
      name,
      text,
      roomId,
      createdAt,
    });
    return this.messageRepository.save(newMessage);
  }
}
