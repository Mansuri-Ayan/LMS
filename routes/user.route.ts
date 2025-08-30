/** @format */

import express, { Request, Response } from "express";
import { registrationUser } from "../controllers/user.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
const userRouter = express.Router({ mergeParams: true });
userRouter.post("/registration", wrapAsync(registrationUser));
export default userRouter;
