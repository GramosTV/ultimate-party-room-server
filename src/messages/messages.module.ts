import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Module } from '@nestjs/common';
import { MessageService } from 'src/db/services/message.service';
import { UserService } from 'src/db/services/user.service';
import { MessageModule } from 'src/db/modules/message.module';
import { UserModule } from 'src/db/modules/user.module';
@Module({
  imports: [MessageModule, UserModule],
  providers: [MessagesGateway, MessagesService, MessageService, UserService],
})
export class MessagesModule {}
