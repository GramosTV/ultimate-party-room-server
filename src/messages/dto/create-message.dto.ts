import { Room } from 'src/db/room/room.entity';
import { MessageEntity } from 'types';

export class CreateMessageDto implements MessageEntity {
  id: string;
  name: string;
  text: string;
  room: Room;
  createdAt: Date;
  roomId: string;
}
