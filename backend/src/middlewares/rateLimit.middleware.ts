import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests allowed per window
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
}

interface ClientRecord {
  timestamps: number[];
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
  } = options;

  const hits = new Map<string, ClientRecord>();

  // Periodically clean up stale IP keys to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      const validTimestamps = record.timestamps.filter(ts => now - ts < windowMs);
      if (validTimestamps.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, { timestamps: validTimestamps });
      }
    }
  }, Math.max(windowMs, 60000));

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = hits.get(ip) || { timestamps: [] };
    const validTimestamps = record.timestamps.filter(ts => now - ts < windowMs);

    const remaining = Math.max(0, max - validTimestamps.length - 1);
    const oldestTimestamp = validTimestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTimeSeconds > 0 ? resetTimeSeconds : Math.ceil(windowMs / 1000));

    if (validTimestamps.length >= max) {
      const minutes = Math.ceil(resetTimeSeconds / 60);
      res.status(statusCode).json({
        success: false,
        error: message || `Too many attempts from this IP. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        retryAfter: resetTimeSeconds,
      });
      return;
    }

    validTimestamps.push(now);
    hits.set(ip, { timestamps: validTimestamps });

    next();
  };
};

// Standard rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many login attempts. For security reasons, please wait a moment before trying again.',
});


export const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes
  message: 'Too many password reset requests. Please wait 15 minutes before requesting another reset token.',
});

export const assistantRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // 25 requests per 15 minutes per IP
  message: 'Too many assistant inquiries from this IP. Please wait a moment before asking further questions.',
});

export const photoTripRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 vision requests per 15 minutes per IP
  message: 'Vision processing limit reached for this session. Please wait a few minutes before analyzing another landmark photo.',
});


