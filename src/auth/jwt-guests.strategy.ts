import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuestsService } from '../guests/guests.service';
import { Guest } from '../guests/entities/guest.entity';

@Injectable()
export class JwtGuestStrategy extends PassportStrategy(Strategy, 'jwt-guests') {
  constructor(
    configService: ConfigService,
    private readonly guestsService: GuestsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.config.jwtGuestSecret'),
    });
  }

  async validate(payload: any): Promise<Guest | undefined> {
    const guest = await this.guestsService.findById(payload.sub);
    if (!guest) {
      throw new NotFoundException(
        'Operation failed. Guest not found or you are not authorized to change this event!',
      );
    }
    return guest;
  }
}
