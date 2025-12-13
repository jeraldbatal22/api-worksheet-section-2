import { add, subtract, multiply, divide } from "../../controller/calculator.controller";
import type { Request, Response } from "express";

const buildRes = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return res as Response;
};

describe("calculator.controller", () => {
  describe("add", () => {
    it("returns summed values for multiple inputs", async () => {
      const cases = [
        { num1: 1, num2: 2, result: 3 },
        { num1: -1, num2: 5, result: 4 },
        { num1: 10.5, num2: 0.5, result: 11 },
      ];

      for (const payload of cases) {
        const req = { body: payload } as Partial<Request>;
        const res = buildRes();
        // @ts-ignore
        await add(req as Request, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          operation: "add",
          result: payload.result,
        });
      }
    });

    it("throws when inputs are not numbers", async () => {
      const req = { body: { num1: "a", num2: 2 } } as Partial<Request>;
      const res = buildRes();
      const next = jest.fn();
      // @ts-ignore
      await add(req as Request, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("subtract", () => {
    it("returns subtraction results", async () => {
      const cases = [
        { int: 5, subtractor: 2, result: 3 },
        { int: 0, subtractor: 3, result: -3 },
        { int: -5, subtractor: -5, result: 0 },
      ];

      for (const payload of cases) {
        const req = { body: payload } as Partial<Request>;
        const res = buildRes();
        // @ts-ignore
        await subtract(req as Request, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          operation: "subtract",
          result: payload.result,
        });
      }
    });

    it("throws when inputs are invalid", async () => {
      const req = { body: { int: 1, subtractor: "x" } } as Partial<Request>;
      const res = buildRes();
      const next = jest.fn();
      // @ts-ignore
      await subtract(req as Request, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("multiply", () => {
    it("returns multiplication results", async () => {
      const cases = [
        { int: 2, multiplier: 3, result: 6 },
        { int: -1, multiplier: 4, result: -4 },
        { int: 0, multiplier: 10, result: 0 },
      ];

      for (const payload of cases) {
        const req = { body: payload } as Partial<Request>;
        const res = buildRes();
        // @ts-ignore
        await multiply(req as Request, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          operation: "multiply",
          result: payload.result,
        });
      }
    });

    it("throws when inputs are invalid", async () => {
      const req = { body: { int: 2, multiplier: null } } as Partial<Request>;
      const res = buildRes();
      const next = jest.fn();
      // @ts-ignore
      await multiply(req as Request, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("divide", () => {
    it("returns division results", async () => {
      const cases = [
        { int: 6, divisor: 3, result: 2 },
        { int: -4, divisor: 2, result: -2 },
        { int: 5, divisor: 2, result: 2.5 },
      ];

      for (const payload of cases) {
        const req = { body: payload } as Partial<Request>;
        const res = buildRes();
        // @ts-ignore
        await divide(req as Request, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          operation: "divide",
          result: payload.result,
        });
      }
    });

    it("throws when divisor is zero", async () => {
      const req = { body: { int: 1, divisor: 0 } } as Partial<Request>;
      const res = buildRes();
      const next = jest.fn();
      // @ts-ignore
      await divide(req as Request, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

