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

  // VIDEO GATEWAY
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

  // The difference between this method and the one above is that this one updates the video moment for new users that'll join the room and not for the users that are already in the room.
  @SubscribeMessage('updateVideoMoment')
  async updateVideoMoment(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoMoment') videoMoment: number,
    @ConnectedSocket() client: Socket,
  ) {
    const updateResult = await this.roomService.updateVideoMoment(
      roomId,
      videoMoment,
    );
    return updateResult;
  }

  @SubscribeMessage('getVideoMoment')
  async getVideoMoment(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const videoMoment = await this.roomService.getVideoMoment(roomId);
    return videoMoment;
  }

  @SubscribeMessage('updateVideoUrl')
  async updateVideoUrl(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoUrl') videoUrl: string,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.roomService.updateVideoUrl(roomId, videoUrl);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('videoUrl', {
        videoUrl,
      });
    });
  }

  @SubscribeMessage('getVideoUrl')
  async getVideoUrl(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const videoUrl = await this.roomService.getVideoUrl(roomId);
    return videoUrl;
  }
  //

  // CANVAS GATEWAY
  @SubscribeMessage('getCanvas')
  async getCanvas(@MessageBody('roomId') roomId: string) {
    const canvas = await this.roomService.getCanvas(roomId);
    return canvas;
  }

  @SubscribeMessage('canvasChange')
  async changeCanvas(
    @MessageBody('roomId') roomId: string,
    @MessageBody('canvasAction') canvasAction: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomService.updateCanvas(roomId, canvasAction);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('canvasChange', canvasAction);
    });
  }

  @SubscribeMessage('canvasClean')
  async eraseCanvas(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomService.clearCanvas(roomId);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('canvasClean');
    });
  }
  //
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
