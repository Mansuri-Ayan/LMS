/** @format */

import express from "express";
import {
  activateUser,
  LoginUse,
  LogoutUser,
  registrationUser,
  socialAuth,
  updateAccessToken,
} from "../controllers/auth.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const authRouter = express.Router({ mergeParams: true });

//Registraion
authRouter.post("/registration", wrapAsync(registrationUser));

authRouter.post("/activate-user", wrapAsync(activateUser));

//Login
authRouter.post("/login", wrapAsync(LoginUse));

//Logout
authRouter.post("/logout", isAuthenticated, wrapAsync(LogoutUser));

authRouter.post("/refreshtoken", wrapAsync(updateAccessToken));

authRouter.post("/social-auth", wrapAsync(socialAuth));


export default authRouter;
