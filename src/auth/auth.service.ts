import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthRegister } from './classes/auth-register';
import { GuestToken, JwtPayload, Tokens } from './types';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserIdentifiers } from './interfaces/user-identifiers.interface';
import { UpdateUserDto } from '../users/dto/update-user-dto';
import { UserWhereConditions } from '../users/types';
import { UpdateResult } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(user: UserIdentifiers): Promise<Tokens> {
    const tokens = await this.getTokens(user.id, user.username);
    await this.updateUserRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string): Promise<UpdateResult> {
    // Set refresh token to null
    return await this.updateUserRefreshTokenHash(userId, null);
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException(
        'User not found or your are not authorized to change this user!',
      );
    }
    this.logger.debug('Found user!');
    const match = await argon2.verify(user.refreshToken, rt);
    if (!match) {
      throw new ForbiddenException(
        'Refresh token does not match. Forbidden action!',
      );
    }
    this.logger.debug('Tokens match');
    const tokens = await this.getTokens(user.id, user.username);
    await this.updateUserRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async register(createUserDto: CreateUserDto): Promise<AuthRegister> {
    const user = new User({
      username: createUserDto.username,
      password: await this.hashString(createUserDto.password),
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });
    const savedUser = await this.usersService.saveUser(user);
    const tokens = await this.getTokens(savedUser.id, savedUser.username);
    await this.updateUserRefreshTokenHash(savedUser.id, tokens.refresh_token);

    const authRegister = new AuthRegister({ ...savedUser, ...tokens });
    return authRegister;
  }

  async generateGuestMagicLink(dto: any): Promise<String> {
    const token = await this.getGuestToken(dto.guestId, dto.eventId);
    return `/magic/rsvp?token=${token.access_token}`;
  }

  // Helper functions

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserIdentifiers | undefined> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { ...identifiers }: UserIdentifiers = user;
      return identifiers;
    }
    return null;
  }

  private async updateUserRefreshTokenHash(
    userId: string,
    jwt: string,
  ): Promise<UpdateResult> {
    const hashedJwt = jwt ? await this.hashJwt(jwt) : null;
    const userDto = new UpdateUserDto();
    userDto.refreshToken = hashedJwt;
    return await this.usersService.updateUserWithQB(userId, userDto);
  }

  private async hashString(data: string): Promise<string> {
    return await bcrypt.hash(data, 10);
  }

  private async hashJwt(jwtString: string): Promise<string> {
    return await argon2.hash(jwtString, { timeCost: 6 });
  }

  private async getTokens(userId: string, username: string): Promise<Tokens> {
    const payload: JwtPayload = { sub: userId, username: username };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string | number>(
        'jwt.config.jwtExpirationTime',
      ),
      secret: this.configService.get<string>('jwt.config.jwtSecret'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string | number>(
        'jwt.config.jwtRefreshExpirationTime',
      ),
      secret: this.configService.get<string>('jwt.config.jwtRefreshSecret'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async getGuestToken(guestId: string, eventId: string): Promise<GuestToken> {
    const payload = { sub: guestId, event: eventId };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string | number>(
        'jwt.config.jwtGuestExpirationTime',
      ),
      secret: this.configService.get<string>('jwt.config.jwtGuestSecret'),
    });

    return { access_token: accessToken };
  }
}
