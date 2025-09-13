/** @format */

import { getUserInfo, updateUserInfo } from "../controllers/user.controllers";
import { isAuthenticated } from "../middleware/auth";
import { wrapAsync } from "../middleware/wrapAsync";

import express from "express";

const userRouter = express.Router({ mergeParams: true });

userRouter.get("/me", isAuthenticated, wrapAsync(getUserInfo));

userRouter.put("/update-user-info", isAuthenticated, wrapAsync(updateUserInfo));

export default userRouter;
