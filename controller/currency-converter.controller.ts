import { asyncHandler } from "../middleware/async-handler.ts";
import currencyConverterService from "../services/currency-converter.service.ts";
import { type Response } from "express";
import { convert } from "../utils/index.ts";
import type { AuthRequest } from "../dto/auth.dto.ts";

class CurrencyConverterController {
  createConversion = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = req.user?.id || req.body.userId; // expects auth middleware or fallback
    const { from_value, from_currency, to_currency } = req.body;

    // Validation for required fields
    if (typeof from_value !== "number" || !from_currency || !to_currency) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. Please provide from_value, from_currency, to_currency, and converted_value.",
      });
    }

    const convertedAmount = await convert(
      from_value,
      from_currency,
      to_currency
    );
    
    try {
      const conversion = await currencyConverterService.saveConversion(userId, {
        from_value,
        from_currency,
        to_currency,
        converted_value: convertedAmount,
      });
      res.status(201).json({
        success: true,
        data: conversion,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Conversion failed",
      });
    }
  });

  getUserConversions = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    try {
      const conversions = await currencyConverterService.getConversionsByUserId(
        req.user.id,
        { limit, offset }
      );
      res.status(200).json({
        success: true,
        data: conversions,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch conversions",
      });
    }
  });
}

export default new CurrencyConverterController();
