/** @format */

import { NextFunction, Request, Response } from "express";

export const wrapAsync =
  (fn: any) => (err: any, req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next).catch(next));
  };
