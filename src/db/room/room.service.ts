import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DeleteResult, Like, Repository, UpdateResult } from 'typeorm';
import { Room } from './room.entity';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { CreateRoomDto } from 'src/rooms/dto/create-room.dto';
import { VideoState } from 'types';
import { MessageService } from '../message/message.service';
import { unlinkSync } from 'fs';
import { join } from 'path';
@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @Inject(UserService) private userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  async findAll(): Promise<Room[]> {
    const rooms = await this.roomRepository.find();
    return rooms;
  }
  async deleteAll(): Promise<DeleteResult> {
    const res = await this.roomRepository.delete({
      id: Like('%%')
    });
    return res;
  } 

  // Instead of any[] should be string[] but typeorm query builder doesn't let me
  async getClientIds(roomId: string): Promise<any[]> {
    const clientIds = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'users')
      .where('room.id = :id', { id: roomId })
      // Didn't figure it out, Typeorm is hard :(
      // .select('users.clientId')
      .getMany();
    return clientIds.map((e) => {
      return e.users.map((user) => {
        return user.clientId;
      });
    })[0];
  }
  async findAllUsersInRoom(roomId: string): Promise<User[]> {
    const roomWithUsers = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'users')
      .where('room.id = :id', { id: roomId })
      .getOne();
    return roomWithUsers?.users;
  }
  async joinRoom(
    roomId: string,
    clientId: string,
  ): Promise<{ roomId: string; clientId: string } | 1> {
    // I KNOW THAT THIS FUNCTION IS BAD, BUT AFTER HOURS OF STRUGGLING WITH TYPEORMS UPDATE METHOD THAT'S THE ONLY WAY I WAS ABLE TO MAKE IT WORK
    const user = await this.userService.findUserWithClientId(clientId);
    const quit = await this.userService.quitRoom(clientId);
    const roomWithUsers = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'users')
      .where('room.id = :id', { id: roomId })
      .getOne();
    await this.roomRepository.save({
      id: roomId,
      users: [...roomWithUsers.users, user],
    });
    const room = await this.findOne(roomId);
    if (quit) {
      await this.quitRoom(quit.clientId);
      await this.userService.joinRoom(room, clientId);
      return { roomId: quit.roomId, clientId: quit.clientId };
    }
    await this.userService.joinRoom(room, clientId);
    return 1;
  }
  async quitRoom(clientId: string) {
    const roomId = await this.userService.getCurrentRoomId(clientId);
    if (!roomId) {
      return;
    }
    const user = await this.userService.findUserWithClientId(clientId);
    const roomWithUsers = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'users')
      .where('room.id = :id', { id: roomId })
      .getOne();
    await this.roomRepository.save({
      id: roomId,
      users: [
        ...roomWithUsers.users.filter(
          (item) => item.clientId !== user.clientId,
        ),
      ],
    });
  }
  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    return room;
  }
  async getCanvas(roomId: string): Promise<string> {
    const canvas = (
      await this.roomRepository
        .createQueryBuilder('room')
        .select('room.canvas')
        .where('room.id = :id', { id: roomId })
        .getOne()
    ).canvas;
    return canvas;
  }

  async getVideoUrl(roomId: string): Promise<string> {
    const videoUrl = (
      await this.roomRepository
        .createQueryBuilder('room')
        .select('room.videoUrl')
        .where('room.id = :id', { id: roomId })
        .getOne()
    )?.videoUrl;
    return videoUrl;
  }

  async getCanvasBgc(roomId: string): Promise<string> {
    const canvasBgc = (
      await this.roomRepository
        .createQueryBuilder('room')
        .select('room.canvasBgc')
        .where('room.id = :id', { id: roomId })
        .getOne()
    )?.canvasBgc;
    return canvasBgc;
  }

  async getVideoMoment(roomId: string): Promise<number> {
    const videoMoment = (
      await this.roomRepository
        .createQueryBuilder('room')
        .select('room.videoMoment')
        .where('room.id = :id', { id: roomId })
        .getOne()
    )?.videoMoment;
    return videoMoment;
  }

  async getVideoState(roomId: string): Promise<number> {
    const videoState = (
      await this.roomRepository
        .createQueryBuilder('room')
        .select('room.videoState')
        .where('room.id = :id', { id: roomId })
        .getOne()
    )?.videoState;
    return videoState;
  }

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const user = await this.userService.findUserWithClientId(
      createRoomDto.clientId,
    );
    const newRoom = this.roomRepository.create({
      users: [user],
      videoUrl: '',
      videoMoment: 0,
      videoState: VideoState.play,
      canvas: '',
      canvasBgc:
        'https://upload.wikimedia.org/wikipedia/commons/7/70/Graph_paper_scan_1600x1000_%286509259561%29.jpg',
    });
    return this.roomRepository.save(newRoom);
  }

  async updateCanvas(
    roomId: string,
    canvasAction: string,
  ): Promise<UpdateResult> {
    let result: string;
    try {
      const canvas = await this.getCanvas(roomId);
      if (canvas) {
        const parsed = await JSON.parse(canvas);
        result = JSON.stringify([...parsed, canvasAction]);
      } else {
        result = JSON.stringify([canvasAction]);
      }
    } catch (err) {
      console.error(err);
    }
    const updateResult = await this.roomRepository.update(roomId, {
      canvas: result,
    });
    return updateResult;
  }

  async updateVideoUrl(
    roomId: string,
    videoUrl: string,
  ): Promise<UpdateResult> {
    if (videoUrl) {
      const updateResult = await this.roomRepository.update(roomId, {
        videoUrl,
      });
      return updateResult;
    } else {
      return { raw: 0, generatedMaps: [] };
    }
  }

  async updateCanvasBgc(
    roomId: string,
    canvasBgc: string,
  ): Promise<UpdateResult> {
    if (canvasBgc) {
      const updateResult = await this.roomRepository.update(roomId, {
        canvasBgc,
      });
      return updateResult;
    } else {
      return { raw: 0, generatedMaps: [] };
    }
  }

  async updateVideoMoment(
    roomId: string,
    videoMoment: number,
  ): Promise<UpdateResult> {
    const updateResult = await this.roomRepository.update(roomId, {
      videoMoment,
    });
    return updateResult;
  }

  async updateVideoState(
    roomId: string,
    videoState: VideoState,
  ): Promise<UpdateResult> {
    const updateResult = await this.roomRepository.update(roomId, {
      videoState,
    });
    return updateResult;
  }

  async clearCanvas(roomId: string): Promise<UpdateResult> {
    const updateResult = await this.roomRepository.update(roomId, {
      canvas: '',
    });
    return updateResult;
  }

  async deleteRoom(roomId: string): Promise<DeleteResult> {
    try {
      await this.deleteVideo(roomId);
      const messages = await this.messageService.findAllWithRoomId(roomId);
      messages.map(async (message) => {  
        await this.messageService.delete(message.id);
      });
      const deleteUserResult = this.roomRepository.delete({
        id: roomId,
      });
      return deleteUserResult;
    } catch (err) {
      console.log(err);
      return { raw: 0 }
    }
  }

  async CleanRoomIfEmpty(roomId: string) {
    const roomWithUsers = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'users')
      .where('room.id = :id', { id: roomId })
      .getOne();
    if (!roomWithUsers?.users.length) {
      this.deleteRoom(roomId);
      return true;
    }
    return false;
  }
  async deleteVideo(roomId: string): Promise<boolean> {
    const room = await this.findOne(roomId);
    if (String(room?.videoUrl).includes('http://localhost')) {
      try {
        const vidPath = join(process.cwd(), '\\src\\uploads\\videos\\');
        unlinkSync(vidPath + room.videoUrl.split('/')[4]);
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }
}
