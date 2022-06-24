import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Room } from '../room/room.entity';
import { User } from './user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByClientId(clientId: string) {
    const user = await this.userRepository.findOne({ where: { clientId } });
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  async findRoomIdWithClientId(clientId: string): Promise<string> {
    return (await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.room', 'room')
      .where('user.clientId = :clientId', { clientId })
      .getOne())?.room?.id
  }
  async findUserWithClientId(clientId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ clientId });
    return user;
  }
  async getUserName(clientId: string): Promise<unknown> {
    const userName = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.name'])
      .where({ clientId })
      .getOne();
    return userName?.name;
  }
  async quitRoom(clientId: string) {
    const userWithRoom = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.room', 'room')
      .where('user.clientId = :clientId', { clientId })
      .getOne();
    if (userWithRoom.id) {
      await this.userRepository.save({
        id: userWithRoom.id,
        room: null,
      });
    }

    if (userWithRoom.room) {
      return { roomId: userWithRoom.room.id, clientId: userWithRoom.clientId };
    }
    return null;
  }
  async createUser(
    name: string,
    clientId: string,
    profilePicture = '',
  ): Promise<User> {
    const newUser = this.userRepository.create({
      name,
      clientId,
      profilePicture,
    });
    return this.userRepository.save(newUser);
  }

  async deleteUser(clientId: string): Promise<DeleteResult> {
    const user = await this.findOneByClientId(clientId);
    if (user?.profilePicture) {
      try {
        const pfpPath = join(
          process.cwd(),
          '\\src\\uploads\\profilePictures\\',
        );
        unlinkSync(pfpPath + user.profilePicture);
      } catch (err) {
        console.error(err);
      }
    }
    const deleteUserResult = this.userRepository.delete({
      clientId,
    });
    return deleteUserResult;
  }

  async getCurrentRoomId(clientId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.room', 'room')
      .where('user.clientId = :clientId', { clientId })
      .getOne();
    if (user?.room) {
      return user.room.id;
    }
    return null;
  }

  async joinRoom(room: Room, clientId: string) {
    const id = (await this.findUserWithClientId(clientId)).id;
    await this.userRepository.save({
      id,
      room,
    });
  }

  async updateProfilePicture(
    clientId: string,
    profilePicture: string,
  ): Promise<UpdateResult> {
    const id = (await this.findOneByClientId(clientId))?.id;
    if (profilePicture) {
      try {
        const updateResult = await this.userRepository.update(id, {
          profilePicture,
        });
        return updateResult;
      } catch (err) {
        console.log('Nothing to delete');
      }
    }
    return { raw: 0, generatedMaps: [] };
  }
}
