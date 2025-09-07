/** @format */

import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const access_token = req.cookies.access_token as string;

  if (!access_token) {
    return next(new ErrorHandler("Please login to access this recouce.", 400));
  }

  const decocded = (await jwt.verify(
    access_token,
    process.env.ACCESS_TOKEN as string
  )) as JwtPayload;

  if (!decocded) {
    return next(new ErrorHandler("Invalid Access Token.", 400));
  }
  console.log(decocded);
  const user = await redis.get(decocded.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  req.user = JSON.parse(user);

  next();
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role.toLowerCase() || "")) {
      return next(
        new ErrorHandler(
          `Role ${req.user?.role} is not allowed to access these recouce`,
          403
        )
      );
    }
    next();
  };
};
