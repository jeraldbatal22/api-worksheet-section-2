import { asyncHandler } from "../../middleware/async-handler";

describe("asyncHandler", () => {
  it("calls wrapped function and passes responses", async () => {
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();
    const handler = jest.fn().mockResolvedValue("ok");

    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards rejection to next", async () => {
    const error = new Error("boom");
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();
    const handler = jest.fn().mockRejectedValue(error);

    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

