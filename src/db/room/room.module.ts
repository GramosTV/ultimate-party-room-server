import { Room } from './room.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { RoomService } from './room.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    UserModule,
    forwardRef(() => MessageModule),
  ],
  providers: [RoomService],
  exports: [TypeOrmModule, RoomService],
})
export class RoomModule {}
