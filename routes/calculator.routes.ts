import { Router } from "express";
import calculatorController from "../controller/calculator.controller.ts";

const calculatorRouter = Router();

calculatorRouter.post("/calculate", calculatorController.calculate);
calculatorRouter.get("/calculate", calculatorController.getAll);

export default calculatorRouter;
