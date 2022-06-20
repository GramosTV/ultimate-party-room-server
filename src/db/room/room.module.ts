import { Room } from './room.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), UserModule],
  providers: [RoomService],
  exports: [TypeOrmModule, RoomService],
})
export class RoomModule {}
