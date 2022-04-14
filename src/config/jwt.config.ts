import { registerAs } from '@nestjs/config';

export default registerAs('jwt.config', () => ({
  jwtSecret: process.env.JWT_AUTH_SECRET,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || '15m',

  jwtGuestSecret: process.env.JWT_GUEST_AUTH_SECRET,
  jwtGuestExpirationTime: process.env.JWT_GUEST_EXPIRATION_TIME || '90d',

  jwtRefreshSecret: process.env.JWT_REFRESH_AUTH_SECRET,
  jwtRefreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
}));
