/** @format */
import { IUser, User } from "../model/user.model";
import ejs from "ejs";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
import senEmail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";

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
    if (req.cookies.access_token || req.cookies.refresh_token) {
      return next(new ErrorHandler("User already Logedin.", 400));
    }
    const { email, password } = req.body as ILoginRequest;

    if (!email || email === "") {
      return next(new ErrorHandler("Please Enter Email.", 400));
    }

    if (!password || password === "") {
      return next(new ErrorHandler("Please Enter Password.", 400));
    }

    const user = await User.findOne({ email });

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
    return next(new ErrorHandler(error.status, 400));
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
    if (!req.cookies.access_token || !req.cookies.refresh_token) {
      return next(new ErrorHandler("User already Logedin.", 400));
    }
    const clearCookieOptions: IClearCookis = {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1,
      secure: process.env.NODE_ENV === "production",
    };
    res.clearCookie("access_token", clearCookieOptions);
    res.clearCookie("refresh_token", clearCookieOptions);
    res
      .status(200)
      .json({ success: true, message: "User Logout Successfull." });
  } catch (error: any) {
    return next(new ErrorHandler(error.status, 400));
  }
};

// interface anynonymous {}
// export const registrationUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//   } catch (error: any) {

//     return next(new ErrorHandler(error.status, 400));
//   }
// };
