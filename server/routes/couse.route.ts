/** @format */

import {
  addAnswer,
  addQuestion,
  editCourse,
  getAllCourse,
  getCourseByUser,
  getSingleCourse,
  uploadCouse,
} from "../controllers/courser.controllers";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";

import { wrapAsync } from "../middleware/wrapAsync";

import express from "express";

const courseRouter = express.Router({ mergeParams: true });

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  wrapAsync(uploadCouse)
);

courseRouter.get("/get-courses", wrapAsync(getAllCourse));

courseRouter.put("/add-question", isAuthenticated, wrapAsync(addQuestion));

courseRouter.put("/add-answer", isAuthenticated, wrapAsync(addAnswer));

courseRouter.get(
  "/get-course-content/:id",
  isAuthenticated,
  wrapAsync(getCourseByUser)
);

courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  wrapAsync(editCourse)
);

courseRouter.get("/get-course/:id", wrapAsync(getSingleCourse));

export default courseRouter;
