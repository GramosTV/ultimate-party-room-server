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
    const users = roomWithUsers.users.map((e) => {
      return e;
    });
    return users;
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
    const users = roomWithUsers.users.map((e) => {
      return e;
    });
    await this.roomRepository.save({
      id: roomId,
      users: [...users, user],
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

  async createRoom(
    createRoomDto: CreateRoomDto,
    createdAt: string = new Date().toJSON().slice(0, 19).replace('T', ' '),
  ): Promise<Room> {
    const user = await this.userService.findUserWithClientId(
      createRoomDto.clientId,
    );
    const newRoom = this.roomRepository.create({ users: [user], createdAt });
    return this.roomRepository.save(newRoom);
  }
}
