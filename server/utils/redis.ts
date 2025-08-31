/** @format */

import { Redis } from "ioredis";
const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("Redis conntected");
    return process.env.REDIS_URL;
  }
  throw new Error("Redis connection Faild.");
};

export const redis = new Redis(redisClient());
