import CalculatorModel, { type Calculator } from '../model/calculator.model.ts';

interface CalculationOptions {
  limit?: number;
  offset?: number;
  userId?: number;
}

class CalculatorService {
  // Addition
  async add(
    num1: number,
    num2: number,
    userId?: number
  ): Promise<Calculator> {
    if (typeof num1 !== "number" || typeof num2 !== "number") {
      throw new Error("num1 and num2 must be numbers");
    }
    return await CalculatorModel.add({ user_id: userId, num1, num2 });
  }

  // Subtraction
  async subtract(
    num1: number,
    num2: number,
    userId?: number
  ): Promise<Calculator> {
    if (typeof num1 !== "number" || typeof num2 !== "number") {
      throw new Error("num1 and num2 must be numbers");
    }
    return await CalculatorModel.subtract({ user_id: userId, num1, num2 });
  }

  // Multiplication
  async multiply(
    num1: number,
    num2: number,
    userId?: number
  ): Promise<Calculator> {
    if (typeof num1 !== "number" || typeof num2 !== "number") {
      throw new Error("num1 and num2 must be numbers");
    }
    return await CalculatorModel.multiply({ user_id: userId, num1, num2 });
  }

  // Division
  async divide(
    num1: number,
    num2: number,
    userId?: number
  ): Promise<Calculator> {
    if (typeof num1 !== "number" || typeof num2 !== "number") {
      throw new Error("num1 and num2 must be numbers");
    }
    if (num2 === 0) {
      throw new Error("Cannot divide by zero");
    }
    return await CalculatorModel.divide({ user_id: userId, num1, num2 });
  }

  // Get calculation by ID
  async getCalculationById(id: number): Promise<Calculator | null> {
    return await CalculatorModel.findById(id);
  }

  // Get all calculations (optionally by user)
  async getCalculations(options: CalculationOptions = {}): Promise<Calculator[]> {
    const limit = options.limit ?? 10;
    const offset = options.offset ?? 0;
    if (limit < 1 || limit > 100) throw new Error('INVALID_LIMIT');
    if (offset < 0) throw new Error('INVALID_OFFSET');
    return await CalculatorModel.findAllByUserId(
      options.userId,
      limit,
      offset
    );
  }
}

export default new CalculatorService();