import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { messageProviders } from '../providers/message.providers';
import { MessageService } from '../services/message.service';

@Module({
  imports: [DatabaseModule],
  providers: [...messageProviders, MessageService],
})
export class MessageModule {}
