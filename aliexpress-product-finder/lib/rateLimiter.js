import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function rateLimiter(req) {
  // Extract the IP address from headers or connection
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

  // Ensure IP is a string and not undefined
  if (typeof ip !== 'string') {
    return { success: false };
  }

  // Increment the request count for the IP address
  const requests = await redis.incr(ip);

  // Set expiration time for the key
  if (requests === 1) {
    await redis.expire(ip, 60); // Expire after 60 seconds
  }

  // Define the maximum allowed requests
  const MAX_REQUESTS = 5;

  // Check if the request limit is exceeded
  if (requests > MAX_REQUESTS) {
    return { success: false };
  }

  return { success: true };
}
