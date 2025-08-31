/** @format */
require("dotenv").config();
import { User } from "../model/user.model";
import ejs from "ejs";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
import senEmail from "../utils/sendMail";
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
