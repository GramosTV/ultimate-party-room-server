import { UserRoomAction } from 'types';
export class UserEntity {
  id: string;
  name: string;
  clientId: string;
  profilePicture: string;
  action?: UserRoomAction;
  timeoutFlag: undefined | true;
}
