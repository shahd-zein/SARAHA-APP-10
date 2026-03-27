import { resolve } from 'node:path';
import { config as dotenvConfig } from 'dotenv';

export const NODE_ENV = process.env.NODE_ENV || 'development';

const envPath = {
  development: '.env.development',
  production: '.env.production',
};

const envFile = envPath[NODE_ENV];
console.log({ NODE_ENV, envFile });

dotenvConfig({
  path: resolve(`./config/${envFile}`)
});

if (!process.env.USER_ACCESS_TOKEN_SECRET_KEY) {
  throw new Error("USER_ACCESS_TOKEN_SECRET_KEY is not defined in your env file!");
}

export const port = parseInt(process.env.PORT ?? '7000');
export const DB_URI = process.env.DB_URI;
export const ENC_BYTE = process.env.ENC_BYTE;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10');

export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY;
export const USER_REFRESH_TOKEN_SECRET_KEY = process.env.USER_REFRESH_TOKEN_SECRET_KEY;

export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY;
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY = process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY;

export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN);
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN);

console.log({ DB_URI, SALT_ROUND, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY });