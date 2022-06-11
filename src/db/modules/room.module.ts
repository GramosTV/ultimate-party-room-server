import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { roomProviders } from '../providers/room.providers';
import { RoomService } from '../services/room.service';

@Module({
  imports: [DatabaseModule],
  providers: [...roomProviders, RoomService],
})
export class RoomModule {}
