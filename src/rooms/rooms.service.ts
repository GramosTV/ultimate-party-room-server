import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from 'src/db/room/room.service';
@Injectable()
export class RoomsService {
  constructor(private readonly roomService: RoomService) {}
  async create(createRoomDto: CreateRoomDto) {
    const room = await this.roomService.createRoom(createRoomDto);
    return room;
  }

  async findAll() {
    const rooms = await this.roomService.findAll();
    return rooms;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
