/** @format */

import express from "express";
import {
  activateUser,
  LoginUse,
  registrationUser,
} from "../controllers/auth.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
const authRouter = express.Router({ mergeParams: true });

//Registraion
authRouter.post("/registration", wrapAsync(registrationUser));
authRouter.post("/activate-user", wrapAsync(activateUser));

//Login
authRouter.post("/login", wrapAsync(LoginUse));

export default authRouter;
