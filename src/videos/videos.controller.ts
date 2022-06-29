import { RoomService } from './../db/room/room.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { createReadStream } from 'fs';

@Controller('videos')
export class VideosController {
  constructor(private readonly roomService: RoomService) {}
  @Get(':video')
  getFile(
    @Param('video') video: string,
    @Response({ passthrough: true }) res,
  ): StreamableFile | string {
    try {
      const file = createReadStream(
        join(process.cwd(), `../ultimate-party-room-server/src/uploads/videos/${video}`),
      );
      res.set({
        'Content-Type': 'video/mp4',
      });
      return new StreamableFile(file);
    } catch (err) {
      return 'File not found';
    }
  }

  @Post(':roomId')
  @UseInterceptors(
    FileInterceptor('video', {
      dest: '../ultimate-party-room-server/src/uploads/videos',
      limits: { fileSize: 100e6 },
    }),
  )
  async uploadSingle(@Param('roomId') roomId: string, @UploadedFile() file) {
    await this.roomService.deleteVideo(roomId);
    await this.roomService.updateVideoUrl(
      roomId,
      'http://localhost:3001/videos/' + file.filename,
    );
    return { videoUrl: 'http://localhost:3001/videos/' + file.filename };
  }
}
