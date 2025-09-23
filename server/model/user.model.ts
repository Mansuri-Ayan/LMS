/** @format */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Document, Model, Schema, model } from "mongoose";

const emailRegrexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export interface IUser extends Document {
  googleId: string;
  githubId: string;
  facebookId: string;
  email: string;
  name: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  coparePassword: (password: string) => Promise<boolean>;
  signedAccessToken: () => {};
  signedRefreshToken: () => {};
}
const userSchema: Schema<IUser> = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    }, // sparse to allow null/undefined values
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: { type: String, required: [true, "Please Enter your name"] },
    email: {
      type: String,
      required: [true, "Please Enter your email"],
      unique: true,
      validate: {
        validator: function (value: string) {
          return emailRegrexPattern.test(value);
        },
      },
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId && !this.facebookId;
      },
      minLength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: { public_id: String, url: String },
    role: {
      type: String,
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    courses: [{ courseId: String }],
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next;
  try {
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
    next();
  } catch (error: any) {
    next(error || "Error while hashing password");
  }
});

userSchema.methods.signedAccessToken = async function () {
  return jwt.sign({ id: this.id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

userSchema.methods.signedRefreshToken = async function () {
  return jwt.sign({ id: this.id }, process.env.REFRESSH_TOKEN || "", {
    expiresIn: "3d",
  });
};

userSchema.methods.coparePassword = async function (
  password: any
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};
export const User: Model<IUser> = model("User", userSchema);
