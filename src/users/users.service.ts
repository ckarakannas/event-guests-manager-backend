import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateQueryBuilder, UpdateResult } from 'typeorm';
import { UpdateUserDto } from './dto/update-user-dto';
import { User } from './entities/user.entity';
import { UserWhereConditions } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private updateUserBaseQuery(
    userId: string,
    dto: UpdateUserDto,
  ): UpdateQueryBuilder<User> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ ...dto })
      .where('id = :userId', { userId });
  }

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

  async deleteUser(userId: string): Promise<DeleteResult> {
    return await this.userRepository.delete(userId);
  }

  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    return await this.userRepository.save(
      new User({
        ...user,
        ...updateUserDto,
      }),
    );
  }

  async updateUserWithQB(
    userId: string,
    dto: UpdateUserDto,
    whereConditions?: UserWhereConditions,
  ): Promise<UpdateResult> {
    const qb = this.updateUserBaseQuery(userId, dto);
    
    if (whereConditions && whereConditions.length > 0) {
      whereConditions.forEach((c) =>
        qb.andWhere(`${c.property} ${c.condition}`),
      );
    }
    return await qb.execute();
  }
}
