import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomModule } from './db/modules/room.module';
@Module({
  imports: [MessagesModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
