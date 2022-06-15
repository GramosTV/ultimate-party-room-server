import { Injectable } from '@nestjs/common';
import { Message } from 'src/db/message/message.entity';
import { MessageService } from 'src/db/message/message.service';
import { RoomService } from 'src/db/room/room.service';
import { UserService } from 'src/db/user/user.service';
import { MessageEntity } from 'types';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}

  async identify(name: string, clientId: string, profilePicture = '') {
    const user = await this.userService.findUserWithClientId(clientId);
    if (user) {
      return user;
    } else {
      // @UseInterceptors(
      //   FileInterceptor('photo', {
      //     dest: '../uploads/profilePictures',
      //     limits: { fileSize: byte * 10 },
      //   }),
      // )
      return this.userService.createUser(name, clientId, profilePicture);
    }
  }

  async getClientName(clientId: string) {
    const userName = await this.userService.getUserName(clientId);
    return userName;
  }
  async getClientIdsByRoomId(roomId: string) {
    const clientIds = await this.roomService.getClientIds(roomId);
    return clientIds;
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

  async findAllWithId(roomId: string): Promise<Message[]> {
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
