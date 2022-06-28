import { RoomEntity } from 'types';
export class RoomActionRes {
  room: RoomEntity;
  roomAction: RoomAction;
}
export enum RoomAction {
  add,
  delete,
}
