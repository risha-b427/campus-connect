import { Router } from "express";
import { getBuildings } from "./buildings.controller.js";

const buildingsRouter = Router();

buildingsRouter.get("/", getBuildings);

export default buildingsRouter;
