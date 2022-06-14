import { Room } from './room.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), UserModule],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class RoomModule {}
