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
  NotFoundException,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { QueryFailedError } from 'typeorm';
import { UpdateUserDto } from '../users/dto/update-user-dto';
import { Public } from './decorators/public-route.decorator';
import { Tokens } from './types';
import { UserIdentifiers } from './interfaces/user-identifiers.interface';
import { CurrentUserId } from './decorators';
import { JwtRefreshGuard } from './guards/jwt-auth-refresh.guard';
import { JwtGuestsAuthGuard } from './guards/jwt-guests-auth.guard';
import { GuestsService } from '../guests/guests.service';
import { CurrentGuest } from './decorators/current-guest.decorator';
import { Guest } from '../guests/entities/guest.entity';

@Controller()
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly guestsService: GuestsService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  async login(@CurrentUser() user: UserIdentifiers): Promise<Tokens> {
    return await this.authService.login(user);
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUserId() userId: string) {
    const result = await this.authService.logout(userId);
    if (result?.affected !== 1) {
      throw new NotFoundException(
        'Operation failed. Event not found or you are not authorized to change this resource!',
      );
    }
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUserId() userId: string,
    @CurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('users/profile')
  async getProfile(@CurrentUserId() userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(
        'Operation failed. User not found or you are not authorized to view this user!',
      );
    }
    return user;
  }

  @Delete('users/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@CurrentUserId() userId: string) {
    const result = await this.usersService.deleteUser(userId);
    if (result?.affected !== 1) {
      throw new ForbiddenException(
        'Operation failed. User not found or you are not authorized to change this user!',
      );
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('users/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.usersService
      .updateUserWithQB(userId, updateUserDto)
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
    if (result?.affected !== 1) {
      throw new ForbiddenException(
        'Operation failed. User not found or you are not authorized to change this user!',
      );
    }
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

  @Public()
  @Post('auth/guest/magiclink')
  async getMagicLinkForGuest(@Body() dto: any) {
    return { magic_link: await this.authService.generateGuestMagicLink(dto) };
  }

  @Public()
  @UseGuards(JwtGuestsAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('auth/guest/verify')
  async verifyMagicLink(@CurrentGuest() guest: Guest) {
    return guest ?? null;
  }
}
