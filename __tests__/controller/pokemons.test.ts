import { getPokemons, POKEMONS_MOCK_DATA } from "../../controller/pokemon.controller";
import { Request, Response } from "express";

describe("getPokemons", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it("should return all pokemons if no query params", async () => {
    // @ts-ignore
    await getPokemons(req as Request, res as Response, () => {});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Successfully fetched Pokemons",
      data: POKEMONS_MOCK_DATA,
    });
  });

  it("should filter pokemons by type", async () => {
    req.query = { type: "Water" };
    // @ts-ignore
    await getPokemons(req as Request, res as Response, () => {});
    const expected = POKEMONS_MOCK_DATA.filter(p =>
      p.type.toLowerCase().includes("water".toLowerCase())
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expected,
      })
    );
  });

  it("should filter pokemons by name", async () => {
    req.query = { name: "chu" };
    // @ts-ignore
    await getPokemons(req as Request, res as Response, () => {});
    const expected = POKEMONS_MOCK_DATA.filter(p =>
      p.name.toLowerCase().includes("chu")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expected,
      })
    );
  });

  it("should filter pokemons by both name and type", async () => {
    req.query = { name: "duck", type: "water" };
    // @ts-ignore
    await getPokemons(req as Request, res as Response, () => {});
    const expected = POKEMONS_MOCK_DATA.filter(p =>
      p.type.toLowerCase().includes("water") &&
      p.name.toLowerCase().includes("duck")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expected,
      })
    );
  });
});
