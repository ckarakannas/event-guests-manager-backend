import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { IsJWT } from 'class-validator';
import { User } from '../../users/entities/user.entity';

export class AuthRegisterDto extends PartialType(User) {
  constructor(partialUser?: Partial<User>) {
    super(User);
    Object.assign(this, partialUser);
  }
  @IsJWT()
  @Expose()
  access_token: string;
}
