import { Injectable } from '@nestjs/common';
import { MessageService } from 'src/db/services/message.service';
import { UserService } from 'src/db/services/user.service';
import { MessageEntity } from 'types';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  async identify(name: string, clientId: string) {
    const user = this.userService.findUserWithClientId(clientId);
    if (user) {
      return user;
    } else {
      return this.userService.createUser(name, clientId);
    }
  }

  async getClientName(clientId: string) {
    const userName = await this.userService.getUserName(clientId);
    return userName;
  }

  async create(createMessageDto: CreateMessageDto) {
    const message: MessageEntity = {
      name: createMessageDto.name,
      text: createMessageDto.text,
      roomId: createMessageDto.roomId,
    };
    await this.messageService.createMessage(
      createMessageDto.name,
      createMessageDto.text,
      createMessageDto.roomId,
    );
    return message;
  }

  async findAllWithId(roomId: string): Promise<MessageEntity[]> {
    const messages = await this.messageService.findAllWithId(roomId);
    return messages;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} message`;
  // }

  // update(id: number, updateMessageDto: UpdateMessageDto) {
  //   return `This action updates a #${id} message`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} message`;
  // }
}
