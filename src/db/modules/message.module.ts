import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Message } from '../entities/Message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  exports: [TypeOrmModule],
})
export class MessageModule {}
