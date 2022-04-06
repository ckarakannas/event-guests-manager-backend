import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { dtoValidator } from '../common/validators';
import { AuthLoginDto } from './dto/auth-login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const dto: AuthLoginDto = await dtoValidator(AuthLoginDto, {
      username,
      password,
    });
    this.logger.debug('Valid Login DTO input!');
    const userIdentifiers = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!userIdentifiers) {
      this.logger.debug(`Invalid username or password for user ${username}`);
      throw new UnauthorizedException('Invalid username or password!');
    }
    return userIdentifiers;
  }
}
