// Lightweight in-memory rate limiter middleware (zero external dependencies)
const rateLimitMap = new Map();

// Background sweep to clear expired windows every 5 minutes
const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (record.resetTime <= now) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

if (sweepInterval.unref) {
    sweepInterval.unref();
}

/**
 * Creates an Express rate-limiting middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 15 mins)
 * @param {number} options.max - Max allowed requests per window (default 10)
 * @param {string} options.message - Error message when rate limit is exceeded
 */
export const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max = 10,
    message = "Too many attempts from this IP, please try again later."
} = {}) => {
    return (req, res, next) => {
        const forwarded = req.headers["x-forwarded-for"];
        const ip = (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : null) ||
                   req.socket.remoteAddress ||
                   "127.0.0.1";
        
        const key = `${req.baseUrl || ""}${req.path}_${ip}`;
        const now = Date.now();

        let record = rateLimitMap.get(key);
        if (!record || record.resetTime <= now) {
            record = { count: 1, resetTime: now + windowMs };
            rateLimitMap.set(key, record);
            return next();
        }

        record.count += 1;
        if (record.count > max) {
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader("Retry-After", retryAfterSec);
            return res.status(429).json({
                success: false,
                message,
                retryAfter: retryAfterSec
            });
        }

        next();
    };
};
