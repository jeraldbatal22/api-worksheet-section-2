import { Router } from "express";
import currencyConverterController from "../controller/currency-converter.controller.ts";

const currencyConvertRouter = Router();

currencyConvertRouter.post("/", currencyConverterController.createConversion);
currencyConvertRouter.get("/", currencyConverterController.getUserConversions);

export default currencyConvertRouter;
