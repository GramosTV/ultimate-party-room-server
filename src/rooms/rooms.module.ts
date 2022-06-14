import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { RoomModule } from 'src/db/room/room.module';
import { RoomService } from 'src/db/room/room.service';
import { UserModule } from 'src/db/user/user.module';
import { MessageModule } from 'src/db/message/message.module';
import { UserService } from 'src/db/user/user.service';
import { MessageService } from 'src/db/message/message.service';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';

@Module({
  imports: [MessageModule, UserModule, RoomModule, MessagesModule],
  providers: [
    RoomsGateway,
    RoomsService,
    MessageService,
    UserService,
    RoomService,
    MessagesService,
  ],
})
export class RoomsModule {}
