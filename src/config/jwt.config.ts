import { registerAs } from '@nestjs/config';

export default registerAs('jwt.config', () => ({
  jwtSecret: process.env.JWT_AUTH_SECRET,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || '15m',
}));
