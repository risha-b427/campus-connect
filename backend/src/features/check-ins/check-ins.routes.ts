import { Router } from "express";
import {
  checkInHandler,
  checkOutHandler,
  getActiveHandler,
} from "./check-ins.controller.js";

const checkInsRouter = Router();

checkInsRouter.get("/active", getActiveHandler);
checkInsRouter.post("/", checkInHandler);
checkInsRouter.patch("/:id/checkout", checkOutHandler);

export default checkInsRouter;