import type { QueryResult } from 'pg';
import { pgDatabase } from '../database/ps.ts';

export type CurrencyCode = 'PHP' | 'USD' | 'JPN';

export interface CurrencyConverter {
  id: number;
  user_id: number;
  from_value: number;
  from_currency: CurrencyCode;
  to_currency: CurrencyCode;
  converted_value: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCurrencyConverterDTO {
  from_value: number;
  from_currency: CurrencyCode;
  to_currency: CurrencyCode;
  converted_value: number;
}

class CurrencyConverterModel {
  private tableName = 'currency_converter';

  // Save a new currency conversion record
  async saveConversion(
    userId: number,
    data: CreateCurrencyConverterDTO
  ): Promise<CurrencyConverter> {
    const query = `
      INSERT INTO ${this.tableName} 
        (user_id, from_value, from_currency, to_currency, converted_value, created_at, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const values = [
      userId,
      data.from_value,
      data.from_currency,
      data.to_currency,
      data.converted_value,
    ];
    const result: QueryResult<CurrencyConverter> = await pgDatabase.query(query, values);
    return result.rows[0];
  }

  // Get a single currency conversion by its from/to currencies, from_value and user id,
  // regardless of direction (from_currency, to_currency or to_currency, from_currency)
  async getConversionByCurrenciesByUserId(
    userId: number,
    currencyA: CurrencyCode,
    currencyB: CurrencyCode,
    fromValue: number
  ): Promise<CurrencyConverter | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
        AND from_value = $4
        AND from_currency = $2 AND to_currency = $3
      LIMIT 1
    `;
    const values = [userId, currencyA, currencyB, fromValue];
    const result: QueryResult<CurrencyConverter> = await pgDatabase.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Get all currency conversions for a user, paginated
  async getConversionsByUserId(
    userId: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<CurrencyConverter[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const values = [userId, limit, offset];
    const result: QueryResult<CurrencyConverter> = await pgDatabase.query(query, values);
    return result.rows;
  }
}

export default new CurrencyConverterModel();