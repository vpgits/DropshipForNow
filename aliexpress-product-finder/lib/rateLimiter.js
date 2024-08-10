import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function rateLimiter(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const requests = await redis.incr(ip);
  
  if (requests === 1) {
    await redis.expire(ip, 60); // Expire after 60 seconds
  }

  if (requests > 5) {
    return { success: false };
  }

  return { success: true };
}