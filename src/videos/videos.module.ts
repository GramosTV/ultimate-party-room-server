import { Module } from '@nestjs/common';
import { RoomModule } from 'src/db/room/room.module';
import { UserModule } from 'src/db/user/user.module';
import { VideosController } from './videos.controller';

@Module({
  imports: [RoomModule],
  controllers: [VideosController],
})
export class VideosModule {}
