/** @format */

import express, { Request, Response } from "express";
import {
  activateUser,
  registrationUser,
} from "../controllers/auth.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
const authRouter = express.Router({ mergeParams: true });

authRouter.post("/registration", wrapAsync(registrationUser));
authRouter.post("/activate-user", wrapAsync(activateUser));

export default authRouter;
