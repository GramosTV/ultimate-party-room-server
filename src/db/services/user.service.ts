import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
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
    return this.userRepository.findOneBy({ clientId });
  }
  async getUserName(clientId: string): Promise<unknown> {
    const userName = await createQueryBuilder('user')
      .select(['user.name'])
      .where({ clientId })
      .getOne();
    return userName;
  }
  async createUser(name: string, clientId: string): Promise<User> {
    const newUser = this.userRepository.create({ name, clientId });
    return this.userRepository.save(newUser);
  }
}
