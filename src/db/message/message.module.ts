import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Message } from './message.entity';
import { RoomModule } from '../room/room.module';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), RoomModule, UserModule],
  providers: [RoomService, UserService],
  exports: [TypeOrmModule],
})
export class MessageModule {}
