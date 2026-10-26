import { Router } from "express";
import { getSpotsHandler } from "./spots.controller.js";

const spotsRouter = Router();

spotsRouter.get("/", getSpotsHandler);

export default spotsRouter;
