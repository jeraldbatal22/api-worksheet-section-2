import { Client } from "pg";
import { PG_DATABASE, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from "../config/env.ts";

export const pgDatabase = new Client({
  host: PG_HOST,
  user: PG_USER,
  port: Number(PG_PORT),
  password: PG_PASSWORD,
  database: PG_DATABASE
});

const connectToDatabase = async () => {
  try {
    await pgDatabase.connect();
    console.log(`Connected to databse`);
  } catch (error) {
    console.log("ERROR CONNECTING TO DATABASE", error);

    process.exit(1);
  }
};

export default connectToDatabase;