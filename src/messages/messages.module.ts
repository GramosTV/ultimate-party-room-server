import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Module } from '@nestjs/common';
import { MessageService } from 'src/db/message/message.service';
import { UserService } from 'src/db/user/user.service';
import { MessageModule } from 'src/db/message/message.module';
import { UserModule } from 'src/db/user/user.module';
import { RoomModule } from 'src/db/room/room.module';
import { RoomService } from 'src/db/room/room.service';
@Module({
  imports: [MessageModule, UserModule, RoomModule],
  providers: [
    MessagesGateway,
    MessagesService,
    MessageService,
    UserService,
    RoomService,
  ],
})
export class MessagesModule {}
