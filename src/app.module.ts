import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomModule } from './db/modules/room.module';
import { MessageModule } from './db/modules/message.module';
import { UserModule } from './db/modules/user.module';
import { RoomsModule } from './rooms/rooms.module';
import { DataSource } from 'typeorm';
import { User } from './db/entities/user.entity';
import { Message } from './db/entities/message.entity';
import { Room } from './db/entities/room.entity';
@Module({
  imports: [
    MessagesModule,
    RoomModule,
    MessageModule,
    UserModule,
    RoomsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'ultimate_party_room',
      entities: [Message, User, Room],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
