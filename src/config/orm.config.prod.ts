import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    dropSchema: false,
    entities: ['dist/**/entities/*.entity.js'],
    extra: {
      // Must consider using ssl certs
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
);
