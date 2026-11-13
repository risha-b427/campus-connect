import { Router } from "express";
import { getSpotsHandler, getSpotHandler } from "./spots.controller.js";

const spotsRouter = Router();

spotsRouter.get("/", getSpotsHandler);
spotsRouter.get("/:id", getSpotHandler);

export default spotsRouter;
