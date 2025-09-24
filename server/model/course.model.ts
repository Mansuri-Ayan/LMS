/** @format */

import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface IComment extends Document {
  user: object;
  question: string;
  questionReplies: IComment[];
}

export interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplys: IComment[];
}

export interface ICourseData extends Document {
  tital: string;
  desciption: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

export interface ILink extends Document {
  tital: string;
  url: string;
}

export interface ICourse extends Document {
  name: string;
  desciption: string;
  price: number;
  estimatedprice?: number;
  thumbnail: { public_id: string; url: string };
  tags: string;
  level: string;
  demoUrl: string;
  benifits: { tital: string }[];
  prerequisites: { tital: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchesed?: number;
}

const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: { type: String },
});

const LinkSchema = new Schema<ILink>({
  tital: { type: String },
  url: { type: String },
});

const commentSchema = new Schema<IComment>({
  user: Object,
  question: { type: String },
  questionReplies: [Object],
});

const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  tital: String,
  videoSection: String,
  desciption: String,
  videoLength: Number,
  videoPlayer: String,
  links: [LinkSchema],
  suggestion: String,
  questions: [commentSchema],
});

const courseSchema: Schema<ICourse> = new Schema({
  name: { type: String, required: true },
  desciption: { type: String, required: true },
  price: { type: Number, required: true },
  estimatedprice: { type: Number },
  thumbnail: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  tags: { type: String, required: true },
  level: { type: String, required: true },
  demoUrl: { type: String, required: true },
  benifits: [{ tital: String }],
  prerequisites: [{ tital: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: { type: Number, default: 0 },
  purchesed: { type: Number, default: 0 },
});

const Course: Model<ICourse> = model("Course", courseSchema);
export default Course;
