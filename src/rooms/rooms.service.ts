import { Inject, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from 'src/db/room/room.service';
import { Socket, Server } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
import { UserService } from 'src/db/user/user.service';
import {
  RoomAction,
  UpdateRes,
  UserAction,
  UserEntity,
  VideoState,
} from 'types';
import { User } from 'src/db/user/user.entity';
@Injectable()
export class RoomsService {
  constructor(
    @Inject(RoomService) private roomService: RoomService,
    @Inject(MessagesService) private messagesService: MessagesService,
    @Inject(UserService) private userService: UserService,
  ) {}

  async create(createRoomDto: CreateRoomDto) {
    const room = await this.roomService.createRoom(createRoomDto);
    return room;
  }

  async findAll() {
    const rooms = await this.roomService.findAll();
    return rooms;
  }
  async handleDisconnect(client: Socket, server: Server) {
    const roomId = await this.userService.getCurrentRoomId(client.id);
    const room = await this.roomService.findOne(roomId);
    if (roomId) {
      const clientIds = (
        await this.messagesService.getClientIdsByRoomId(roomId)
      ).filter((item) => item !== client.id);
      clientIds.map(async (e) => {
        const user = await this.userService.findUserWithClientId(client.id);
        client.to(e).emit('usersInRoom', {
          updatedItem: user,
          result: UserAction.left,
        });
      });
      server.emit('room', {
        updatedItem: room,
        result: RoomAction.delete,
      });
    }
    await this.roomService.quitRoom(client.id);
    await this.userService.deleteUser(client.id);
    const result = await this.roomService.checkIfEmpty(roomId);
    if (result) {
      server.emit('room', { room, roomAction: RoomAction.delete });
    }
  }

  // VIDEO SERVICE
  async videoState(roomId: string, videoState: VideoState, client: Socket) {
    const user = await this.userService.findOneByClientId(client.id);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    await this.roomService.updateVideoState(roomId, videoState);
    clientIds.map(async (e) => {
      client.to(e).emit('videoState', { videoState, user });
    });
  }
  async videoMoment(roomId: string, videoMoment: number, client: Socket) {
    const user = await this.userService.findOneByClientId(client.id);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('videoMoment', { videoMoment, user });
    });
  }
  async updateVideoMoment(roomId: string, videoMoment: number) {
    return await this.roomService.updateVideoMoment(roomId, videoMoment);
  }
  async getVideoMoment(roomId: string) {
    return await this.roomService.getVideoMoment(roomId);
  }
  async updateVideoUrl(roomId: string, videoUrl: string, client: Socket) {
    const user = await this.userService.findOneByClientId(client.id);
    await this.roomService.updateVideoUrl(roomId, videoUrl);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    )?.filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('updateVideoUrl', { videoUrl, user });
    });
    return videoUrl;
  }
  async getVideoUrl(roomId: string) {
    return await this.roomService.getVideoUrl(roomId);
  }
  async getVideoState(roomId: string) {
    return await this.roomService.getVideoState(roomId);
  }
  // ROOM's CANVAS GATEWAY

  async getCanvas(roomId: string) {
    return await this.roomService.getCanvas(roomId);
  }
  async canvasChange(roomId: string, canvasAction: string, client: Socket) {
    await this.roomService.updateCanvas(roomId, canvasAction);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('canvasChange', canvasAction);
    });
  }
  async canvasClean(roomId: string, client: Socket) {
    await this.roomService.clearCanvas(roomId);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('canvasClean');
    });
  }
  async getCanvasBgc(roomId: string) {
    return await this.roomService.getCanvasBgc(roomId);
  }
  async updateCanvasBgc(roomId: string, canvasBgc: string, client: Socket) {
    await this.roomService.updateCanvasBgc(roomId, canvasBgc);
    const clientIds = (
      await this.messagesService.getClientIdsByRoomId(roomId)
    ).filter((item) => item !== client.id);
    clientIds.map(async (e) => {
      client.to(e).emit('updateCanvasBgc', canvasBgc);
    });
  }
  async joinRoom(roomId: string, client: Socket, server: Server) {
    const joinResult = await this.roomService.joinRoom(roomId, client.id);
    const room = await this.roomService.findOne(roomId);
    const updateResult: UpdateRes = {
      updatedItem: room,
      result: joinResult ? 1 : 0,
    };
    if (joinResult !== 1) {
      const roomId = await this.userService.getCurrentRoomId(client.id);
      const room = await this.roomService.findOne(roomId);
      if (roomId) {
        const clientIds = (
          await this.messagesService.getClientIdsByRoomId(roomId)
        ).filter((item) => item !== client.id);
        clientIds.map(async (e) => {
          const user = await this.userService.findUserWithClientId(client.id);
          client.to(e).emit('usersInRoom', {
            updatedItem: user,
            result: UserAction.left,
          });
        });
      }
      const result = await this.roomService.checkIfEmpty(roomId);
      if (result) {
        server.emit('room', {
          updatedItem: room,
          result: RoomAction.delete,
        });
      }
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
  async findAllUsersInRoom(roomId: string) {
    return await this.roomService.findAllUsersInRoom(roomId);
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} room`;
  // }

  // update(id: number, updateRoomDto: UpdateRoomDto) {
  //   return `This action updates a #${id} room`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} room`;
  // }
}
