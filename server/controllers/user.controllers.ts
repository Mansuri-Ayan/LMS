/** @format */

import { IUser, User } from "../model/user.model";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { getUserById } from "../services/user.services";
import { redis } from "../utils/redis";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.user);
    const userId = req.user?._id as string;
    getUserById(userId, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.status, 400));
  }
};

interface IUpdateUserInfo {
  name?: string;
  email?: string;
}
export const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body as IUpdateUserInfo;
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password");

    if (email && user) {
      const isExists = await User.findOne({ email });
      if (isExists) {
        return next(new ErrorHandler("User with email already exists.", 400));
      }
      user.email = email;
    }

    if (name && user) {
      user.name = name;
    }

    await redis.set(userId as string, JSON.stringify(user));

    await user?.save();

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

interface IChangePassword {
  oldpassword: string;
  newPassword: string;
}
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldpassword, newPassword } = req.body as IChangePassword;

    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (user?.password === undefined) {
      return next(
        new ErrorHandler(
          "Password change not allowed for social login accounts.",
          400
        )
      );
    }

    if (!user) {
      return next(new ErrorHandler("No User found", 400));
    }

    const isMatch = await user.coparePassword(oldpassword);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid Old Password", 400));
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({ success: true, user });
    
  } catch (error: any) {
    return next(new ErrorHandler(error.status, 400));
  }
};

// interface anynonymous {}
// export const xyz = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//   } catch (error: any) {

//     return next(new ErrorHandler(error.status, 400));
//   }
// };
