import { Request, Response } from "express";

export const mockRequest = {} as unknown as Request;
export const mockResponse = {
  send: jest.fn(),
} as unknown as Response;
