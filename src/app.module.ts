import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomModule } from './db/room/room.module';
import { MessageModule } from './db/message/message.module';
import { UserModule } from './db/user/user.module';
import { RoomsModule } from './rooms/rooms.module';
import { DataSource } from 'typeorm';
import { User } from './db/user/user.entity';
import { Message } from './db/message/message.entity';
import { Room } from './db/room/room.entity';
import { PhotosModule } from './photos/photos.module';
import { VideosController } from './videos/videos.controller';
import { VideosModule } from './videos/videos.module';
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
      autoLoadEntities: true,
      bigNumberStrings: false,
      synchronize: true, // TRUE ONLY FOR DEVELOPMENT
      // logging: true,
      // migrations: ['dist/migration/*.js'], PRODUCTION
      // cli: {
      //   migrationsDir: 'migration',
      // },
    }),
    PhotosModule,
    VideosModule,
  ],
  controllers: [AppController, VideosController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
