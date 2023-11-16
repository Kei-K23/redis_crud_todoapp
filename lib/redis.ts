import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from "@/key";
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
dotenv.config();
export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});
