import { Injectable, Inject } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { Room } from './room.entity';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { CreateRoomDto } from 'src/rooms/dto/create-room.dto';
@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Room[]> {
    const rooms = await this.roomRepository.find();
    return rooms;
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
    return roomWithUsers.users;
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
      createdAt: new Date().toJSON().slice(0, 19).replace('T', ' '),
    });
    if (quit) {
      return { roomId: quit.roomId, clientId: quit.clientId };
    }
    return 1;
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
    ).videoUrl;
    return videoUrl;
  }

  async getVideoMoment(roomId: string): Promise<number> {
    const videoMoment = (
      await this.roomRepository
        .createQueryBuilder('room')
        .select('room.videoMoment')
        .where('room.id = :id', { id: roomId })
        .getOne()
    ).videoMoment;
    return videoMoment;
  }

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const user = await this.userService.findUserWithClientId(
      createRoomDto.clientId,
    );
    const newRoom = this.roomRepository.create({
      users: [user],
      createdAt: new Date().toJSON().slice(0, 19).replace('T', ' '),
      videoUrl: '',
      videoMoment: 0,
      canvas: '',
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
    const updateResult = await this.roomRepository.update(roomId, {
      videoUrl,
    });
    return updateResult;
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

  async clearCanvas(roomId: string): Promise<UpdateResult> {
    const updateResult = await this.roomRepository.update(roomId, {
      canvas: '',
    });
    return updateResult;
  }
}
