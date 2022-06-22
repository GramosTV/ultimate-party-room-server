import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { Message } from './message.entity';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../user/user.module';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => RoomModule),
    UserModule,
  ],
  providers: [MessageService],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
