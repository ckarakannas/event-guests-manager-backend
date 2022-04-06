import { IsByteLength, IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(5, 20)
  username: string;

  @IsString()
  @Length(8, 32)
  @IsByteLength(1, 72)
  password: string;

  @IsString()
  @Length(8, 32)
  @IsByteLength(1, 72)
  retypedPassword: string;

  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsString()
  @Length(2, 100)
  lastName: string;

  @IsEmail()
  @Length(2, 320)
  email: string;
}
