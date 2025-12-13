import { test, expect } from "@playwright/test";
import { BASE_URL } from "../../config/env";
import { getAuthToken } from "../utils";

test.describe("Calculator E2E API", () => {
  test.describe("POST /api/v1/calculator/add", () => {
    const cases = [
      { num1: 1, num2: 2, result: 3 },
      { num1: -1, num2: 5, result: 4 },
      { num1: 10.5, num2: 0.5, result: 11 },
    ];

    for (const payload of cases) {
      test(`returns sum ${payload.num1} + ${payload.num2} = ${payload.result}`, async ({
        request,
      }) => {
        const token = await getAuthToken(request);

        const response = await request.post(
          `${BASE_URL}/api/v1/calculator/add`,
          {
            data: payload,
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.operation).toBe("add");
        expect(body.result).toBe(payload.result);
      });
    }

    test("returns error when non-numeric input", async ({ request }) => {
      const token = await getAuthToken(request);
      const response = await request.post(`${BASE_URL}/api/v1/calculator/add`, {
        data: { num1: "a", num2: 2 },
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      expect(response.status()).toBe(500);
      // Optionally check for error format
      const body = await response.json();
      expect(body.message).toMatch(/num1 and num2 must be numbers/i);
    });
  });

  test.describe("POST /api/v1/calculator/subtract", () => {
    const cases = [
      { int: 5, subtractor: 2, result: 3 },
      { int: 0, subtractor: 3, result: -3 },
      { int: -5, subtractor: -5, result: 0 },
    ];

    for (const payload of cases) {
      test(`returns subtraction ${payload.int} - ${payload.subtractor} = ${payload.result}`, async ({
        request,
      }) => {
        const token = await getAuthToken(request);
        const response = await request.post(
          `${BASE_URL}/api/v1/calculator/subtract`,
          {
            data: payload,
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.operation).toBe("subtract");
        expect(body.result).toBe(payload.result);
      });
    }

    test("returns error for invalid inputs", async ({ request }) => {
      const token = await getAuthToken(request);
      const response = await request.post(
        `${BASE_URL}/api/v1/calculator/subtract`,
        {
          data: { int: 1, subtractor: "x" },
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBeGreaterThanOrEqual(400);
      // Optionally check for error format
      const body = await response.json();
      expect(body.message).toMatch(/int and subtractor must be numbers/i);
    });
  });

  test.describe("POST /api/v1/calculator/multiply", () => {
    const cases = [
      { int: 2, multiplier: 3, result: 6 },
      { int: -1, multiplier: 4, result: -4 },
      { int: 0, multiplier: 10, result: 0 },
    ];

    for (const payload of cases) {
      test(`returns multiplication ${payload.int} * ${payload.multiplier} = ${payload.result}`, async ({
        request,
      }) => {
        const token = await getAuthToken(request);
        const response = await request.post(
          `${BASE_URL}/api/v1/calculator/multiply`,
          {
            data: payload,
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.operation).toBe("multiply");
        expect(body.result).toBe(payload.result);
      });
    }

    test("returns error for invalid multiply input", async ({ request }) => {
      const token = await getAuthToken(request);
      const response = await request.post(
        `${BASE_URL}/api/v1/calculator/multiply`,
        {
          data: { int: 2, multiplier: null },
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBeGreaterThanOrEqual(400);
      // Optionally check for error format
      const body = await response.json();
      expect(body.message).toMatch(/int and multiplier must be numbers/i);
    });
  });

  test.describe("POST /api/v1/calculator/divide", () => {
    const cases = [
      { int: 6, divisor: 3, result: 2 },
      { int: -4, divisor: 2, result: -2 },
      { int: 5, divisor: 2, result: 2.5 },
    ];

    for (const payload of cases) {
      test(`returns division ${payload.int} / ${payload.divisor} = ${payload.result}`, async ({
        request,
      }) => {
        const token = await getAuthToken(request);
        const response = await request.post(
          `${BASE_URL}/api/v1/calculator/divide`,
          {
            data: payload,
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.operation).toBe("divide");
        expect(body.result).toBe(payload.result);
      });
    }

    test("returns error when invalid divisor input", async ({ request }) => {
      const token = await getAuthToken(request);
      const response = await request.post(
        `${BASE_URL}/api/v1/calculator/divide`,
        {
          data: { int: 1, divisor: 0 },
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status()).toBeGreaterThanOrEqual(400);
      // Optionally check for error format
      const body = await response.json();
      expect(body.message).toMatch(/Cannot divide by zero/i);
    });
  });
});
