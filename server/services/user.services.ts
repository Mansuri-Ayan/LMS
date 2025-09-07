/** @format */

import { Response } from "express";
import { User } from "../model/user.model";

export const getUserById = async (id: string, res: Response) => {
  const user = await User.findById(id);
  res.status(201).json({ succses: true, user });
};
