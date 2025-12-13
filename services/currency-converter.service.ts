import CurrencyConverterModel, {
  type CurrencyConverter,
  type CreateCurrencyConverterDTO,
  type CurrencyCode,
} from "../model/currency-converter.model.ts";

interface CurrencyQueryOptions {
  limit?: number;
  offset?: number;
}

class CurrencyConverterService {
  // Save a new currency conversion record
  async saveConversion(
    userId: number,
    data: CreateCurrencyConverterDTO
  ): Promise<CurrencyConverter> {
    if (
      typeof data.from_value !== "number" ||
      !["PHP", "USD", "JPN"].includes(data.from_currency) ||
      !["PHP", "USD", "JPN"].includes(data.to_currency) ||
      typeof data.converted_value !== "number"
    ) {
      throw new Error("Invalid data for currency conversion");
    }
    const findConversionByCurrenciesByUserId =
      await CurrencyConverterModel.getConversionByCurrenciesByUserId(
        userId,
        data.from_currency,
        data.to_currency,
        data.from_value
      );
    if (findConversionByCurrenciesByUserId) {
      throw new Error("Already convert");
    }
    return await CurrencyConverterModel.saveConversion(userId, data);
  }

  // Get all conversions for a user, paginated
  async getConversionsByUserId(
    userId: number,
    options: CurrencyQueryOptions = {}
  ): Promise<CurrencyConverter[]> {
    const limit = options.limit ?? 10;
    const offset = options.offset ?? 0;
    if (limit < 1 || limit > 100) throw new Error("INVALID_LIMIT");
    if (offset < 0) throw new Error("INVALID_OFFSET");

    return await CurrencyConverterModel.getConversionsByUserId(
      userId,
      limit,
      offset
    );
  }
}

export default new CurrencyConverterService();
