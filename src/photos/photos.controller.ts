import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
const byte = 1048576;
@Controller('photos')
export class PhotosController {
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      dest: '../uploads/profilePictures',
      limits: { fileSize: byte * 10 },
    }),
  )
  uploadSingle(@UploadedFile() file) {
    console.log('file saved successfully');
  }
}
