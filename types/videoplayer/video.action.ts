import { UserEntity, VideoState } from 'types';
export class VideoMomentAction {
  videoMoment: number;
  user: UserEntity;
}
export class VideoStateAction {
  videoState: VideoState;
  user: UserEntity;
}

export class VideoUrlAction {
  videoUrl: string;
  user: UserEntity;
}
