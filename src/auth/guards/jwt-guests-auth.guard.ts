import { AuthGuard } from '@nestjs/passport';

export class JwtGuestsAuthGuard extends AuthGuard('jwt-guests') {}
