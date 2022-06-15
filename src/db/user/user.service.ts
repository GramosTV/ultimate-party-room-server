import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
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
    return userName.name;
  }
  async quitRoom(clientId: string) {
    const userWithRoom = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.room', 'room')
      .where('user.clientId = :clientId', { clientId })
      .getOne();
    await this.userRepository.save({
      id: userWithRoom.id,
      room: null,
    });
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
}
