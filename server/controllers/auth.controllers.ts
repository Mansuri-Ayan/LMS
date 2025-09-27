/** @format */
import { IUser, User } from "../model/user.model";
import ejs from "ejs";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import path from "path";
import senEmail from "../utils/sendMail";
import {
  accessTokenOtions,
  refereshTokenOtions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";

interface IRegistrationbody {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export const registrationUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email);
    if (!email || email === "") {
      return next(new ErrorHandler("No email is provided", 400));
    }
    const isExists = await User.findOne({ email });
    if (isExists) {
      return next(new ErrorHandler("User already exits", 400));
    }
    const user: IRegistrationbody = { name, email, password };
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { name: user.name, activationCode };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mail/actionTemplet.ejs"),
      data
    );
    try {
      await senEmail({
        email: user.email,
        subject: "Activate your account",
        template: "actionTemplet.ejs",
        data: data,
      });
      res.status(201).json({
        success: true,
        message: `please check your email ${user.email} to activate your account`,
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
  }
};
interface IActiovationtoken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActiovationtoken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(activationCode);
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );
  return { token, activationCode };
};
interface IActiovationRequest {
  activation_token: string;
  activation_code: string;
}
export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { activation_token, activation_code } = req.body as IActiovationRequest;
  const newUser: { user: IUser; activationCode: string } = jwt.verify(
    activation_token,
    process.env.ACTIVATION_SECRET as Secret
  ) as { user: IUser; activationCode: string };
  if (newUser.activationCode !== activation_code) {
    return next(new ErrorHandler("Invalid activation code", 400));
  }
  const { name, email, password } = newUser.user;
  const existUser = await User.findOne({ email });
  if (existUser) {
    return next(new ErrorHandler("Email already exists.", 400));
  }
  const user = User.create({ name, email, password });
  res.status(200).json({
    success: true,
  });
};

interface ILoginRequest {
  email: string;
  password: string;
}
export const LoginUse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as ILoginRequest;

    if (!email || email === "") {
      return next(new ErrorHandler("Please Enter Email.", 400));
    }

    if (!password || password === "") {
      return next(new ErrorHandler("Please Enter Password.", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Email.", 400));
    }
    console.log(user);
    const isMatch = await user.coparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid Password.", 400));
    }

    sendToken(user, 200, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

interface IClearCookis {
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const LogoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clearCookieOptions: IClearCookis = {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1,
      secure: process.env.NODE_ENV === "production",
    };
    res.clearCookie("access_token", clearCookieOptions);
    res.clearCookie("refresh_token", clearCookieOptions);
    const userId = req.user?._id as string;
    await redis.del(userId);
    res
      .status(200)
      .json({ success: true, message: "User Logout Successfull." });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

export const updateAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    // const a = req.cookies.access_token;

    const decocded = (await jwt.verify(
      refresh_token,
      process.env.REFRESSH_TOKEN as Secret
    )) as JwtPayload;

    if (!decocded) {
      return next(new ErrorHandler("Could not refresh token", 400));
    }

    const session = await redis.get(decocded.id as string);

    if (!session) {
      return next(new ErrorHandler("Could not refresh token", 400));
    }

    const user = JSON.parse(session);

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN as Secret,
      {
        expiresIn: "5m",
      }
    );
    const refereshToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN as Secret,
      {
        expiresIn: "3d",
      }
    );
    req.user = user;
    res.cookie("access_token", accessToken, accessTokenOtions);
    res.cookie("refresh_token", refereshToken, refereshTokenOtions);
    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}
export const socialAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, avatar } = req.body as ISocialAuthBody;
    const user = await User.findOne({ email });
    if (!user) {
      const newUser = await User.create({ ...req.body });
      sendToken(newUser, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
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

//     return next(new ErrorHandler(error.message, 400));
//   }
// };
