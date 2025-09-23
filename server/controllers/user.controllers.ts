/** @format */

import { IUser, User } from "../model/user.model";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { getUserById } from "../services/user.services";
import { redis } from "../utils/redis";
import cloudinary from "cloudinary";

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
    const user = await User.findById(userId);

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

    await user?.save();
    await redis.set(userId as string, JSON.stringify(user));

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

    const user = await User.findById(userId).select("+password");
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

    if (!oldpassword || oldpassword === "") {
      return next(new ErrorHandler("Enter Value for old password", 400));
    }

    if (!newPassword || newPassword === "") {
      return next(new ErrorHandler("Enter Value for new password", 400));
    }

    if (oldpassword === newPassword) {
      return next(
        new ErrorHandler("New Password cannot be same as old password.", 400)
      );
    }

    const isMatch = await user.coparePassword(oldpassword);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid Old Password", 400));
    }

    user.password = newPassword;

    await user.save();
    await redis.set(userId as string, JSON.stringify(user));

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

interface IAvatarUpdate {
  avatar?: string;
}
export const updateProfileAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { avatar } = req.body as IAvatarUpdate;

    if (!avatar) {
      return next(new ErrorHandler("No Image is provided", 400));
    }

    const userId = req.user?._id;
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return next(new ErrorHandler("No User found", 400));
    }

    if (user.avatar.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      const response = await cloudinary.v2.uploader.upload(avatar as string, {
        folder: "wanderlust_DEV",
        allowedFormat: ["png", "jpg", "jpeg"],
      });

      user.avatar = {
        public_id: response.public_id,
        url: response.secure_url,
      };
    } else {
      const response = await cloudinary.v2.uploader.upload(avatar as string, {
        folder: "wanderlust_DEV",
        allowedFormat: ["png", "jpg", "jpeg"],
      });

      user.avatar = {
        public_id: response.public_id,
        url: response.secure_url,
      };
    }
    await user.save();
    await redis.set(userId as string, JSON.stringify(user));
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.log(error);
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
