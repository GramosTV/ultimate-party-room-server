import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Response,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { UserService } from 'src/db/user/user.service';
@Controller('photos')
export class PhotosController {
  constructor(private readonly userService: UserService) {}
  @Get(':photo')
  getFile(
    @Param('photo') photo: string,
    @Response({ passthrough: true }) res,
  ): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), `../ultimate-party-room-server/src/uploads/profilePictures/${photo}`),
    );
    res.set({
      'Content-Type': 'image',
    });
    return new StreamableFile(file);
  }

  @Post(':clientId')
  @UseInterceptors(
    FileInterceptor('photo', {
      dest: '../upr-server/src/uploads/profilePictures',
      limits: { fileSize: 10e6 },
    }),
  )
  uploadSingle(@Param('clientId') clientId: string, @UploadedFile() file) {
    this.userService.updateProfilePicture(clientId, file.filename);
  }
}
