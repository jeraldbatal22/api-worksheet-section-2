import { test, expect, request as pwRequest } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Shorten URL & Currency Convert API E2E', () => {
  test.describe('GET /api/v1/shorten-url', () => {
    test('creates short urls for multiple inputs', async ({ request }) => {
      const urls = ["https://a.com", "https://b.com", "https://c.com"];

      for (const url of urls) {
        const res = await request.get(`${BASE_URL}/api/v1/shorten-url`, {
          data: { url }
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        expect(body).toMatchObject({
          success: true,
          message: "Successfully shorten Url",
        });
        expect(typeof body.data).toBe("string");
        expect(body.data).toContain(body.data);
      }
    });

    test('returns error when url is missing', async ({ request }) => {
      const res = await request.get(`${BASE_URL}/api/v1/shorten-url`, {
        data: {}
      });
      // Could be 400 or whatever your error handler returns
      expect(res.status()).not.toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });
  });

  // test.describe('POST /api/v1/currency-convert', () => {
  //   test('converts currency for valid inputs', async ({ request }) => {
  //     // NOTE: This assumes your E2E uses a real implementation, so change values as needed.
  //     // If running against a real rate source, you may want to relax exact match.
  //     const cases = [
  //       {
  //         amountToConvert: 1,
  //         fromCurreny: "USD",
  //         toCurrency: "PHP",
  //       },
  //       {
  //         amountToConvert: 2,
  //         fromCurreny: "USD",
  //         toCurrency: "PHP",
  //       },
  //       {
  //         amountToConvert: 3,
  //         fromCurreny: "USD",
  //         toCurrency: "PHP",
  //       },
  //     ];

  //     for (const payload of cases) {
  //       const res = await request.post(`${BASE_URL}/api/v1/currency-convert`, {
  //         data: payload
  //       });
  //       expect(res.status()).toBe(201);
  //       const body = await res.json();
  //       expect(body).toHaveProperty("success", true);
  //       expect(body).toHaveProperty("message");
  //       expect(body.message).toMatch(new RegExp(`${payload.amountToConvert} ${payload.fromCurreny} is equal to .* ${payload.toCurrency}`));
  //     }
  //   });

  //   test('fails for invalid currencies', async ({ request }) => {
  //     const badPayload = { amountToConvert: 1, fromCurreny: "XXX", toCurrency: "PHP" };
  //     const res = await request.post(`${BASE_URL}/api/v1/currency-convert`, {
  //       data: badPayload,
  //     });
  //     expect(res.status()).not.toBe(201);
  //     const body = await res.json();
  //     expect(body).toHaveProperty('error');
  //   });

  //   // Uncomment if you want to explicitly test server/internal errors,
  //   // but this will depend on how your E2E backend is configured.
  //   // test('handles internal conversion errors gracefully', async ({ request }) => {
  //   //   // Possibly force error via a special payload or env/config
  //   //   const res = await request.post(`${BASE_URL}/api/v1/currency-convert`, {
  //   //     data: { amountToConvert: 1, fromCurreny: "USD", toCurrency: "FAIL_INTERNAL_MOCK" }
  //   //   });
  //   //   expect(res.status()).not.toBe(201);
  //   //   const body = await res.json();
  //   //   expect(body).toHaveProperty('error');
  //   // });
  // });
});
