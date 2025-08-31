/** @format */

import express, { Request, Response } from "express";
import { registrationUser } from "../controllers/user.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
const authRouter = express.Router({ mergeParams: true });

authRouter.post("/registration", wrapAsync(registrationUser));

export default authRouter;
