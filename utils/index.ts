import axios from "axios";
import type { T_Currency, T_File, T_Message } from "../types/index.ts";
import {
  API_KEY_EXCHANGE_RATE,
  API_URL_EXCHANGE_RATE,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from "../config/env.ts";
import path from "path";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
// import type { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

// Function to fetch exchange rates from an external API
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await axios.get(
      `${API_URL_EXCHANGE_RATE}?apikey=${API_KEY_EXCHANGE_RATE}`
    );
    return response.data.rates; // Return the exchange rates from USD
  } catch (error) {
    // console.error("Error fetching exchange rates", error);
    throw new Error(
      error instanceof Error ? error.message : "Unable to fetch exchange rates"
    );
  }
}

// Convert function
async function convert(
  fromValue: number,
  fromCurrency: T_Currency,
  toCurrency: T_Currency
): Promise<number> {
  try {
    const rates = await fetchExchangeRates();
    // Convert from the source currency to USD
    const fromRate = rates[fromCurrency];

    // Convert from USD to the target currency
    const toRate = rates[toCurrency];

    // Perform the conversion: (fromValue / fromRate) * toRate
    const convertedValue = (fromValue / fromRate) * toRate;

    return convertedValue;
  } catch (error) {
    console.error("Conversion error", error);
    throw new Error("Conversion failed");
  }
}

// Helper functions for messages
async function readMessages(filesDir: any): Promise<T_Message[]> {
  try {
    const data = await fs.readFile(filesDir, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeMessages(
  filesDir: any,
  messages: T_Message[]
): Promise<void> {
  await fs.writeFile(filesDir, JSON.stringify(messages, null, 2), "utf-8");
}

// Helper functions for files
async function readFiles(filesDir: any): Promise<T_File[]> {
  try {
    const files = await fs.readdir(filesDir);
    const fileList: T_File[] = [];

    for (const file of files) {
      if (file === "data.json") {
        const data = await fs.readFile(
          path.join(filesDir, "data.json"),
          "utf-8"
        );
        const fileData = JSON.parse(data);
        fileList.push(...fileData);
      }
    }

    return fileList;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeFiles(filesDir: any, files: T_File[]): Promise<void> {
  await fs.writeFile(
    path.join(filesDir, "data.json"),
    JSON.stringify(files, null, 2),
    "utf-8"
  );
}

const generateAccessToken = (payload: string | object | Buffer) => {
  // Fallback to a sane default to avoid passing undefined to jwt.sign
  const expiresIn: StringValue | number =
    (JWT_EXPIRES_IN as StringValue | number) || "15m";

  const options = { expiresIn };

  return jwt.sign(payload, JWT_SECRET || "secret", options) as any;
};

const generateRefreshToken = (payload: string | object | Buffer) => {
  const expiresIn: StringValue | number =
    (JWT_REFRESH_EXPIRES_IN as StringValue | number) || "7d";

  const options = { expiresIn };

  return jwt.sign(payload, JWT_SECRET || "secret", options) as any;
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET! || "secret") as any;
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET! || "secret") as any;
};

export {
  convert,
  fetchExchangeRates,
  readMessages,
  writeMessages,
  readFiles,
  writeFiles,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
