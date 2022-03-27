import { User } from '../users/entities/user.entity';
import {
  Controller,
  Post,
  UseGuards,
  Get,
  BadRequestException,
  Body,
  Delete,
  SerializeOptions,
  ClassSerializerInterceptor,
  UseInterceptors,
  InternalServerErrorException,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { QueryFailedError } from 'typeorm';
import { UpdateUserDto } from '../users/dto/update-user-dto';
import { Public } from './decorators/public-route.decorator';

@Controller()
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@CurrentUser() user: User): Promise<object | undefined> {
    return this.authService.login(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('users/profile')
  async getProfile(@CurrentUser() user: User): Promise<User | undefined> {
    return user;
  }

  @Delete('users/profile')
  async deleteProfile(@CurrentUser() user: User): Promise<object | undefined> {
    await this.usersService.deleteUser(user);
    return { message: 'User deleted!' };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('users/profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    return await this.usersService
      .updateUser(user, updateUserDto)
      .catch((error: any) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('duplicate')
        ) {
          throw new BadRequestException('Username or email is already in use!');
        } else {
          throw new InternalServerErrorException(
            'An internal server error has occured!',
          );
        }
      });
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('auth/register')
  async create(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException('Passwords are not identical!');
    }

    return await this.authService
      .register(createUserDto)
      .catch((error: any) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('duplicate')
        ) {
          throw new BadRequestException('Username or email is already in use!');
        } else {
          throw new InternalServerErrorException(
            'An internal server error has occured!',
          );
        }
      });
  }
}
