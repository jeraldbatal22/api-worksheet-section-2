import { Router } from "express";
import pokemonController from "../controller/pokemon.controller.ts";

const pokemonRouter = Router();

pokemonRouter.post("/", pokemonController.create);
pokemonRouter.get("/", pokemonController.getAll);

export default pokemonRouter;
