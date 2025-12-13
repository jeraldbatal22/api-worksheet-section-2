import {
  authenticate,
  isSessionValid,
  createSession,
  clearSession,
} from "../app.ts";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.ts";

const buildRes = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return res as Response;
};

describe("auth middleware", () => {
  beforeEach(() => {
    clearSession();
  });

  it("blocks when not authenticated", () => {
    const req = { headers: {} } as Partial<Request>;
    const res = buildRes();
    const next = jest.fn();

    authenticate(req as Request, res, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks when token invalid", () => {
    const req = { headers: { authorization: "Bearer invalid" } } as Partial<Request>;
    const res = buildRes();
    const next = jest.fn();

    authenticate(req as Request, res, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows request when authenticated and authorized", () => {
    const session = createSession();
    const req = { headers: { authorization: `Bearer ${session.token}` } } as Partial<Request>;
    const res = buildRes();
    const next = jest.fn();

    authenticate(req as Request, res, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });
});

describe("isSessionValid", () => {
  beforeEach(() => clearSession());

  it("returns false when no session", () => {
    expect(isSessionValid("token")).toBe(false);
  });

  it("returns false when token mismatched", () => {
    createSession();
    expect(isSessionValid("other")).toBe(false);
  });

  it("returns true for valid session", () => {
    const session = createSession();
    expect(isSessionValid(session.token)).toBe(true);
  });
});

