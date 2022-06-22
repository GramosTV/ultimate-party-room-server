import { UpdateRes, UserAction, VideoState, RoomAction } from 'types';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from 'src/db/room/room.service';
import { Socket, Server } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
import { UserService } from 'src/db/user/user.service';
import { Inject } from '@nestjs/common';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly roomsService: RoomsService,
    @Inject(RoomService) private roomService: RoomService,
    @Inject(MessagesService) private messagesService: MessagesService,
    @Inject(UserService) private userService: UserService,
  ) {}
  async handleDisconnect(client: Socket) {
    await this.roomsService.handleDisconnect(client, this.server);
  }
  @SubscribeMessage('createRoom')
  async create(@ConnectedSocket() client: Socket) {
    const room = await this.roomsService.create({ clientId: client.id });
    this.server.emit('room', { room, roomAction: RoomAction.add });
    return room;
  }

  // VIDEO GATEWAY
  @SubscribeMessage('videoState')
  async changeVideoState(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoState') videoState: VideoState,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.videoState(roomId, videoState, client);
  }

  @SubscribeMessage('videoMoment')
  async changeVideoMoment(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoMoment') videoMoment: number,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.videoMoment(roomId, videoMoment, client);
  }

  // The difference between this method and the one above is that this one updates the video moment for new users that'll join the room and not for the users that are already in the room.
  @SubscribeMessage('updateVideoMoment')
  async updateVideoMoment(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoMoment') videoMoment: number,
  ) {
    return this.roomsService.updateVideoMoment(roomId, videoMoment);
  }

  @SubscribeMessage('getVideoMoment')
  async getVideoMoment(@MessageBody('roomId') roomId: string) {
    return await this.roomsService.getVideoMoment(roomId);
  }

  @SubscribeMessage('updateVideoUrl')
  async updateVideoUrl(
    @MessageBody('roomId') roomId: string,
    @MessageBody('videoUrl') videoUrl: string,
    @ConnectedSocket() client: Socket,
  ) {
    return await this.roomsService.updateVideoUrl(roomId, videoUrl, client);
  }

  @SubscribeMessage('getVideoUrl')
  async getVideoUrl(@MessageBody('roomId') roomId: string) {
    return await this.roomsService.getVideoUrl(roomId);
  }

  @SubscribeMessage('getVideoState')
  async getVideoState(@MessageBody('roomId') roomId: string) {
    return await this.roomsService.getVideoState(roomId);
  }
  //

  // ROOM's CANVAS GATEWAY
  @SubscribeMessage('getCanvas')
  async getCanvas(@MessageBody('roomId') roomId: string) {
    return await this.roomsService.getCanvas(roomId);
  }

  @SubscribeMessage('canvasChange')
  async changeCanvas(
    @MessageBody('roomId') roomId: string,
    @MessageBody('canvasAction') canvasAction: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.canvasChange(roomId, canvasAction, client);
  }

  @SubscribeMessage('canvasClean')
  async eraseCanvas(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.canvasClean(roomId, client);
  }

  @SubscribeMessage('getCanvasBgc')
  async getCanvasBgc(@MessageBody('roomId') roomId: string) {
    return await this.roomsService.getCanvasBgc(roomId);
  }

  @SubscribeMessage('updateCanvasBgc')
  async updateCanvasBgc(
    @MessageBody('roomId') roomId: string,
    @MessageBody('canvasBgc') canvasBgc: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.updateCanvasBgc(roomId, canvasBgc, client);
  }
  //
  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    return await this.roomsService.joinRoom(roomId, client, this.server);
  }
  @SubscribeMessage('findAllUsersInRoom')
  async findAllUsersInRoom(@MessageBody('roomId') roomId: string) {
    return await this.roomsService.findAllUsersInRoom(roomId);
  }
  @SubscribeMessage('findAllRooms')
  async findAll() {
    return await this.roomsService.findAll();
  }

  // @SubscribeMessage('findOneRoom')
  // findOne(@MessageBody() id: number) {
  //   return this.roomsService.findOne(id);
  // }

  // @SubscribeMessage('updateRoom')
  // update(@MessageBody() updateRoomDto: UpdateRoomDto) {
  //   return this.roomsService.update(updateRoomDto.id, updateRoomDto);
  // }

  // @SubscribeMessage('removeRoom')
  // remove(@MessageBody() id: number) {
  //   return this.roomsService.remove(id);
  // }
}
