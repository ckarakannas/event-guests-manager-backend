import { User } from '../users/entities/user.entity';
import { AuthRegisterDto } from './dto/auth-register.dto';
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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

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

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('users/profile')
  async getProfile(@CurrentUser() user: User): Promise<User | undefined> {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/profile')
  async deleteProfile(@CurrentUser() user: User): Promise<object | undefined> {
    await this.usersService.deleteUser(user);
    return { message: 'User deleted!' };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('auth/register')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = new User();

    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException('Passwords are not identical!');
    }

    const existingUser = await this.usersService.findOne(
      createUserDto.username,
      createUserDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Username or email is already in use!');
    }

    user.username = createUserDto.username;
    user.password = await this.authService.hashPassword(createUserDto.password);
    user.email = createUserDto.email;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;

    const saved_user = await this.usersService.saveUser(user);
    const access_token = await this.authService.login(saved_user);
    const authDto = new AuthRegisterDto(saved_user);
    authDto.access_token = access_token['access_token'];

    return await authDto;
  }
}
