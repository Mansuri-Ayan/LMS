/** @format */

import express, { Request, Response } from "express";
import { registrationUser } from "../controllers/user.controllers";
import { wrapAsync } from "../middleware/wrapAsync";
const userRouter = express.Router({ mergeParams: true });
// userRouter.post("/registration", async (req: Request, res: Response) => {
//   return res.send("working");
// });
userRouter.post("/registration", registrationUser);
export default userRouter;
