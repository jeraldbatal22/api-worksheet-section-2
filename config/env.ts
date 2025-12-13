import { config } from "dotenv";

config();

export const {
  PORT,
  API_URL_EXCHANGE_RATE,
  API_KEY_EXCHANGE_RATE,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
  BASE_URL,
  PG_HOST,
  PG_USER,
  PG_PORT,
  PG_PASSWORD,
  PG_DATABASE,
} = process.env;
