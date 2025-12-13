import {
  shortenUrl,
  currencyConvert,
} from "../../controller/shorten-url.controller";
import { convert } from "../../utils";
import type { Request, Response } from "express";

jest.mock("nanoid", () => ({
  nanoid: jest
    .fn()
    .mockReturnValueOnce("abc123")
    .mockReturnValueOnce("def456")
    .mockReturnValue("ghi789"),
}));

jest.mock("../../utils", () => {
  const actual = jest.requireActual("../../utils");
  return {
    ...actual,
    convert: jest.fn(),
  };
});

const buildRes = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return res as Response;
};

describe("shorten-url.controller", () => {
  describe("shortenUrl", () => {
    it("creates short urls for multiple inputs", async () => {
      const urls = ["https://a.com", "https://b.com", "https://c.com"];

      for (const url of urls) {
        const req = { body: { url } } as Partial<Request>;
        const res = buildRes();
        // @ts-ignore
        await shortenUrl(req as Request, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          message: "Successfully shorten Url",
          data: expect.stringContaining("http://localhost:3000/"),
        });
      }
    });

    it("throws when url is missing", async () => {
      const req = { body: {} } as Partial<Request>;
      const res = buildRes();
      const next = jest.fn();
      // @ts-ignore
      await shortenUrl(req as Request, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  // describe("currencyConvert", () => {
  //   beforeEach(() => {
  //     jest.resetAllMocks();
  //   });

  //   it("converts currency for valid inputs", async () => {
  //     (convert as jest.Mock)
  //       .mockResolvedValueOnce(10)
  //       .mockResolvedValueOnce(20)
  //       .mockResolvedValueOnce(30);
  //     const cases = [
  //       {
  //         amountToConvert: 1,
  //         fromCurreny: "USD",
  //         toCurrency: "PHP",
  //         expected: 10,
  //       },
  //       {
  //         amountToConvert: 2,
  //         fromCurreny: "USD",
  //         toCurrency: "PHP",
  //         expected: 20,
  //       },
  //       {
  //         amountToConvert: 3,
  //         fromCurreny: "USD",
  //         toCurrency: "PHP",
  //         expected: 30,
  //       },
  //     ];

  //     for (const payload of cases) {
  //       const req = { body: payload } as Partial<Request>;
  //       const res = buildRes();
  //       // @ts-ignore
  //       await currencyConvert(req as Request, res, jest.fn());
  //       expect(convert).toHaveBeenCalledWith(
  //         payload.amountToConvert,
  //         payload.fromCurreny,
  //         payload.toCurrency
  //       );
  //       expect(res.status).toHaveBeenCalledWith(201);
  //       expect(res.send).toHaveBeenCalledWith({
  //         success: true,
  //         message: `${
  //           payload.amountToConvert
  //         } USD is equal to ${payload.expected.toFixed(2)} PHP`,
  //       });
  //     }
  //   });

  //   it("fails for invalid currencies", async () => {
  //     const req = {
  //       body: { amountToConvert: 1, fromCurreny: "XXX", toCurrency: "PHP" },
  //     } as Partial<Request>;
  //     const res = buildRes();
  //     const next = jest.fn();
  //     // @ts-ignore
  //     await currencyConvert(req as Request, res, next);
  //     expect(next).toHaveBeenCalled();
  //   });

  //   // it("bubbles up conversion errors", async () => {
  //   //   (convert as jest.Mock).mockRejectedValue(new Error("fail"));
  //   //   const req = {
  //   //     body: { amountToConvert: 1, fromCurreny: "USD", toCurrency: "PHP" },
  //   //   } as Partial<Request>;
  //   //   const res = buildRes();
  //   //   const next = jest.fn();
  //   //   // @ts-ignore
  //   //   await currencyConvert(req as Request, res, next);
  //   //   expect(next).toHaveBeenCalled();
  //   // });
  // });
});
