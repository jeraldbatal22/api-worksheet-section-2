import { T_Session } from "../types";

const DEFAULT_USERNAME: string = "admin";
const DEFAULT_PASSWORD: string = "cats123";

const DEFAULT_SESSION_LIMIT = 1 * 60 * 1000; // 1 minute;
let SESSION: T_Session | null = null;
let SESSION_TIME_STAMP: number | null = null;

export {
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
  DEFAULT_SESSION_LIMIT,
  SESSION,
  SESSION_TIME_STAMP
}