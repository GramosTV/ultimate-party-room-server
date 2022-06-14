import { UpdateRes, UserAction, VideoState } from 'types';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from 'src/db/room/room.service';
import { Socket, Server } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
import { User } from 'src/db/user/user.entity';
import { UserService } from 'src/db/user/user.service';
@WebSocketGateway()
export class RoomsGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly roomsService: RoomsService,
    private readonly roomService: RoomService,
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('createRoom')
  async create(@ConnectedSocket() client: Socket) {
    const room = await this.roomsService.create({ clientId: client.id });
    this.server.emit('room', room);
    return room;
  }

  @SubscribeMessage('videoState')
  async changeVideoState(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoState') videoState: VideoState,
    @ConnectedSocket() client: Socket,
  ) {
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('videoState', videoState);
    });
  }

  @SubscribeMessage('videoMoment')
  async changeVideoMoment(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoMoment') videoMoment: number,
    @ConnectedSocket() client: Socket,
  ) {
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('videoMoment', {
        videoMoment,
      });
    });
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const joinResult = await this.roomService.joinRoom(roomId, client.id);
    const room = await this.roomService.findOne(roomId);
    const updateResult: UpdateRes = {
      updatedItem: room,
      result: joinResult ? 1 : 0,
    };
    if (joinResult !== 1) {
      const clientIds = await this.messagesService.getClientIdsByRoomId(
        joinResult.roomId,
      );
      clientIds.map(async (e) => {
        const user = await this.userService.findUserWithClientId(client.id);
        client.to(e).emit('usersInRoom', {
          updatedItem: user,
          result: UserAction.left,
        });
      });
    } else {
      const clientIds = (
        await this.messagesService.getClientIdsByRoomId(roomId)
      ).filter((item) => item !== client.id);
      clientIds.map(async (e) => {
        const user = await this.userService.findUserWithClientId(client.id);
        client.to(e).emit('usersInRoom', {
          updatedItem: user,
          result: UserAction.joined,
        });
      });
    }
    return updateResult;
  }
  @SubscribeMessage('findAllUsersInRoom')
  async findAllUsersInRoom(@MessageBody('roomId') roomId: string) {
    const usersInRoom = await this.roomService.findAllUsersInRoom(roomId);
    return usersInRoom;
  }
  @SubscribeMessage('findAllRooms')
  async findAll() {
    const rooms = await this.roomsService.findAll();
    return rooms;
  }

  @SubscribeMessage('findOneRoom')
  findOne(@MessageBody() id: number) {
    return this.roomsService.findOne(id);
  }

  @SubscribeMessage('updateRoom')
  update(@MessageBody() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(updateRoomDto.id, updateRoomDto);
  }

  @SubscribeMessage('removeRoom')
  remove(@MessageBody() id: number) {
    return this.roomsService.remove(id);
  }
}
