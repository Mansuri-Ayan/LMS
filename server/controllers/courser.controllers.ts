/** @format */

import { NextFunction, Request, Response } from "express";
import Course from "../model/course.model";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";
import { redis } from "../utils/redis";
import mongoose from "mongoose";

export const uploadCouse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (data.thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "course",
      });
      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    createCourse(data, res, next);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

export const editCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    const courseId = req.params.id;
    const courseDetails = await Course.findById(courseId);

    if (thumbnail) {
      await cloudinary.v2.uploader.destroy(
        courseDetails?.thumbnail?.public_id as string
      );
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "course",
      });
      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $set: data },
      {
        new: true,
      }
    );
    console.log(course);
    res.status(201).json({ success: true, course });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

//get single course without purchesing
export const getSingleCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("working");
    const courseId = req.params.id;
    const isCaheExist = await redis.get(courseId);
    if (isCaheExist) {
      const course = JSON.parse(isCaheExist);
      res.status(200).json({ cahe: "hited", success: true, course });
    } else {
      const course = await Course.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );
      await redis.set(courseId, JSON.stringify(course));
      return res.status(200).json({ success: true, course });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.status, 400));
  }
};

//get All courses without purchesing
export const getAllCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isCaheExist = await redis.get("allCourses");
    if (isCaheExist) {
      const courses = JSON.parse(isCaheExist);
      return res.status(200).json({ cahe: "hited", success: true, courses });
    } else {
      console.log("working");
      const courses = await Course.find({}).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );
      await redis.set("allCourses", JSON.stringify(courses));
      return res.status(200).json({ success: true, courses });
    }
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

//get Course content -- only for valid user

export const getCourseByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userCoursesList = req.user?.courses;
    const courseId = req.params.id;
    const courseExists = await userCoursesList?.find(
      (course: any) => course._id.toString() === courseId.toString()
    );
    if (!courseExists) {
      return next(new ErrorHandler("You are not enrolled in this course", 403));
    }
    const course = await Course.findById(courseId);
    const content = course?.courseData;
    return res.status(200).json({ success: true, content });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}
export const addQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, courseId, contentId }: IAddQuestionData = req.body;
    const user = req.user;
    if (!mongoose.isValidObjectId(contentId)) {
      console.log("it stuking here");
      return next(new ErrorHandler("Invalid content Id", 400));
    }
    const course = await Course.findById(courseId);

    const courseContent = course?.courseData?.find((item: any) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new ErrorHandler("Invalid content Id", 400));
    }
    const newQuestion: any = {
      user,
      question,
      questionReplies: [],
    };
    courseContent.questions.push(newQuestion);
    await course?.save();
    return res.status(200).json({ success: true, course });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}
export const addAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { answer, courseId, contentId, questionId }: IAddAnswerData =
      req.body;
    if (!mongoose.isValidObjectId(contentId)) {
    }
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.status, 400));
  }
};

// interface xyz {}
// export const xyz = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
// return res.status(200).json({ success: true });
//   } catch (error: any) {
// console.log(error);
//     return next(new ErrorHandler(error.status, 400));
//   }
// };
