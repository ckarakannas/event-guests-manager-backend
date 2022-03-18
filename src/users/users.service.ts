import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findOne(username: string, email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: [{ username: username }, { email: email }],
    });
  }

  async findById(userId: string): Promise<User | undefined> {
    return await this.userRepository.findOne(userId);
  }

  async saveUser(user: User): Promise<User | undefined> {
    return await this.userRepository.save(user);
  }

  async deleteUser(user: User): Promise<User | undefined> {
    return await this.userRepository.remove(user);
  }
}
