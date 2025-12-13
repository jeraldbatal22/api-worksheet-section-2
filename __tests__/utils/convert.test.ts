import axios from "axios";
import { fetchExchangeRates, convert } from "../../utils";

jest.mock("axios");

describe("utils convert", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("fetchExchangeRates returns rates", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { rates: { USD: 1, PHP: 50 } },
    });

    const rates = await fetchExchangeRates();
    expect(axios.get).toHaveBeenCalled();
    expect(rates).toEqual({ USD: 1, PHP: 50 });
  });

  // it("fetchExchangeRates throws on error", async () => {
  //   (axios.get as jest.Mock).mockRejectedValue(new Error("fail"));

  //   await expect(fetchExchangeRates()).rejects.toThrow("Unable to fetch exchange rates");
  // });

  it("convert converts values using rates", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { rates: { USD: 1, PHP: 50, JPY: 150 } },
    });

    const result1 = await convert(10, "USD", "PHP");
    const result2 = await convert(100, "JPY", "USD");
    const result3 = await convert(5, "PHP", "JPY");

    expect(result1).toBe(500);
    expect(result2).toBeCloseTo(0.6666667);
    expect(result3).toBeCloseTo(15);
  });
});

