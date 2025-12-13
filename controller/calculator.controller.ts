import type { Response, NextFunction } from 'express';
import CalculatorService from '../services/calculator.service.ts';
import type { AuthRequest } from '../dto/auth.dto.ts';

class CalculatorController {
  // Create calculation (add, subtract, multiply, divide)
  async calculate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { num1, num2, operation } = req.body;
      if (typeof num1 !== 'number' || typeof num2 !== 'number') {
        res.status(400).json({ error: 'num1 and num2 must be numbers' });
        return;
      }
      let result;
      const userId = req.user?.id;
      switch (operation) {
        case '+':
          result = await CalculatorService.add(num1, num2, userId);
          break;
        case '-':
          result = await CalculatorService.subtract(num1, num2, userId);
          break;
        case '*':
          result = await CalculatorService.multiply(num1, num2, userId);
          break;
        case '/':
          result = await CalculatorService.divide(num1, num2, userId);
          break;
        default:
          res.status(400).json({ error: 'Invalid operation' });
          return;
      }
      res.status(201).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Cannot divide by zero') {
          res.status(400).json({ error: error.message });
          return;
        }
        if (
          error.message === "num1 and num2 must be numbers" ||
          error.message === "INVALID_LIMIT" ||
          error.message === "INVALID_OFFSET"
        ) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  // Get all calculations (optionally filtered by user for authenticated)
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let limit = parseInt(req.query.limit as string) || 10;
      let offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.id;
      const calculations = await CalculatorService.getCalculations({
        limit,
        offset,
        userId,
      });

      res.json({ data: calculations });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_LIMIT' || error.message === 'INVALID_OFFSET') {
          res.status(400).json({ error: 'Invalid pagination parameters' });
          return;
        }
      }
      next(error);
    }
  }

  // Get calculation by ID
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid calculation ID' });
        return;
      }
      const calculation = await CalculatorService.getCalculationById(id);
      if (!calculation) {
        res.status(404).json({ error: 'Calculation not found' });
        return;
      }
      res.json({ data: calculation });
    } catch (error) {
      next(error);
    }
  }
}

export default new CalculatorController();