import { Module } from '@nestjs/common';
import { UserModule } from 'src/db/user/user.module';
import { UserService } from 'src/db/user/user.service';
import { PhotosController } from './photos.controller';

@Module({
  imports: [UserModule],
  controllers: [PhotosController],
  providers: [UserService],
})
export class PhotosModule {}
