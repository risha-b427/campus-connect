import { Router } from "express";
import { getFeedHandler } from "./feed.controller.js";

const feedRouter = Router();

feedRouter.get("/", getFeedHandler);

export default feedRouter;
