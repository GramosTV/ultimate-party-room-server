import { UserVideoAction } from 'types';
export class UserEntity {
  id: string;
  name: string;
  clientId: string;
  profilePicture: string;
  action?: UserVideoAction;
  timeoutFlag: undefined | true;
}
