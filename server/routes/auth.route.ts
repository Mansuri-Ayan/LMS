/** @format */

import express from "express";
import {
  activateUser,
  LoginUse,
  LogoutUser,
  registrationUser,
} from "../controllers/auth.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
const authRouter = express.Router({ mergeParams: true });

//Registraion
authRouter.post("/registration", wrapAsync(registrationUser));
authRouter.post("/activate-user", wrapAsync(activateUser));

//Login
authRouter.post("/login", wrapAsync(LoginUse));

//Logout
authRouter.post("/logout", wrapAsync(LogoutUser));

export default authRouter;
