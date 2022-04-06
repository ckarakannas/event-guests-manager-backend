import { Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

export class AuthRegister extends User {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
