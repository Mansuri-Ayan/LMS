/** @format */

import { Response } from "express";

import Course from "../model/course.model";

import { wrapAsync } from "../middleware/wrapAsync";

export const createCourse = wrapAsync(async (data: any, res: Response) => {
  const course = await Course.create(data);
  res.status(201).json({
    success: true,
    course,
  });
});
