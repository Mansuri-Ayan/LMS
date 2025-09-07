/** @format */

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../model/user.model";
import { redis } from "./redis";
interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

const refereshTokenExpire = parseInt(
  process.env.REFRESSH_TOKEN_EXPIRE || "1200",
  10
);

export const accessTokenOtions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 1000),
  maxAge: accessTokenExpire * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refereshTokenOtions: ITokenOptions = {
  expires: new Date(Date.now() + refereshTokenExpire * 1000),
  maxAge: refereshTokenExpire * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  try {
    const accessToken = await user.signedAccessToken();
    console.log(accessToken);
    const refereshTokenn = await user.signedRefreshToken();
    console.log(refereshTokenn);
    await redis.set(user.id, JSON.stringify(user) as any);

    if (process.env.NODE_ENV === "production") {
      accessTokenOtions.secure = true;
    }

    res.cookie("access_token", accessToken, accessTokenOtions);
    res.cookie("refresh_token", refereshTokenn, refereshTokenOtions);
    res.status(statusCode).json({ success: true, user, accessToken });
  } catch (error: any) {
    // return next(new ErrorHandler(error.status, 400));
  }
};
