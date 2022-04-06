import { IsByteLength, IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 32)
  @IsByteLength(1, 72)
  password: string;
}
