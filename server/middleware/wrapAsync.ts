import { Request, Response, NextFunction } from "express";

export const wrapAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("❌ Async error caught in wrapAsync:", err);
      next(err);
    });
  };

  