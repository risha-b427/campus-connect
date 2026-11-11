import { Router } from "express";
import {
  checkOutHandler,
  createCheckInHandler,
  getMyCheckInsHandler,
} from "./check-ins.controller.js";

const checkInsRouter = Router();

checkInsRouter.post("/", createCheckInHandler);
checkInsRouter.patch("/:id/check-out", checkOutHandler);
checkInsRouter.get("/me", getMyCheckInsHandler);

export default checkInsRouter;
