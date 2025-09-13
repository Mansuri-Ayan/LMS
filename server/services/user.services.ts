/** @format */

import { Response } from "express";
import { User } from "../model/user.model";
import { redis } from "../utils/redis";

export const getUserById = async (id: string, res: Response) => {
  const JSuser = await redis.get(id);
  if (JSuser) {
    const user = await JSON.parse(JSuser as string);
    delete user.password;
    res.status(201).json({ succses: true, user });
  }
};
