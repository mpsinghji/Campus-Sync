import rateLimit, { MemoryStore } from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SIGNAL_FILE = path.join(__dirname, "..", ".rate_limit_reset_signal");

// Explicit store instances for inspection and targeted reset
export const authStore = new MemoryStore();
export const otpStore = new MemoryStore();

// Rate limiter for login endpoints: 30 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  store: authStore,
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.headers["x-test-bypass-rate-limit"] === "true",
  handler: (req, res, next, options) => {
    const retryAfter = res.getHeader("Retry-After") || Math.ceil(options.windowMs / 1000);
    return res.status(options.statusCode).json({
      success: false,
      message: "Too many login attempts from this network. Please wait before trying again.",
      retryAfter: Number(retryAfter) || 900,
    });
  },
  statusCode: 429,
});

// Rate limiter for OTP verification and resend: 30 requests per 15 minutes per IP
export const otpLimiter = rateLimit({
  store: otpStore,
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.headers["x-test-bypass-rate-limit"] === "true",
  handler: (req, res, next, options) => {
    const retryAfter = res.getHeader("Retry-After") || Math.ceil(options.windowMs / 1000);
    return res.status(options.statusCode).json({
      success: false,
      message: "Too many OTP attempts from this network. Please wait before trying again.",
      retryAfter: Number(retryAfter) || 900,
    });
  },
  statusCode: 429,
});

// Programmatic reset helper for an IP address across both limiters
export const resetRateLimitForIp = async (ip) => {
  if (!ip) return false;
  try {
    if (typeof authStore.resetKey === "function") await authStore.resetKey(ip);
    if (typeof otpStore.resetKey === "function") await otpStore.resetKey(ip);
    if (typeof authLimiter.resetKey === "function") await authLimiter.resetKey(ip);
    if (typeof otpLimiter.resetKey === "function") await otpLimiter.resetKey(ip);
    return true;
  } catch (err) {
    console.error("[RateLimit] Error resetting rate limit for IP:", ip, err);
    return false;
  }
};

// Programmatic reset helper for all keys across both limiters
export const resetAllRateLimits = async () => {
  try {
    if (typeof authStore.resetAll === "function") await authStore.resetAll();
    if (typeof otpStore.resetAll === "function") await otpStore.resetAll();
    return true;
  } catch (err) {
    console.error("[RateLimit] Error resetting all rate limits:", err);
    return false;
  }
};

// Local maintenance signal watcher for server-side / operational recovery (bootstrap recovery)
const handleSignal = async () => {
  try {
    if (!fs.existsSync(SIGNAL_FILE)) return;
    const content = fs.readFileSync(SIGNAL_FILE, "utf8").trim();
    if (content.startsWith("reset")) {
      console.log("[RateLimit] Operational reset signal detected. Clearing all in-memory rate limits...");
      await resetAllRateLimits();
      console.log("[RateLimit] All in-memory rate limits cleared successfully.");
      fs.writeFileSync(SIGNAL_FILE, `cleared at ${new Date().toISOString()}\n`, "utf8");
    }
  } catch (watcherErr) {
    // Safe catch on concurrent read/write
  }
};

try {
  if (!fs.existsSync(SIGNAL_FILE)) {
    fs.writeFileSync(SIGNAL_FILE, "ready\n", "utf8");
  }

  // OS event watcher (instantaneous event dispatch)
  const watcher = fs.watch(SIGNAL_FILE, async (eventType) => {
    if (eventType === "change" || eventType === "rename") {
      await handleSignal();
    }
  });
  if (watcher && typeof watcher.unref === "function") {
    watcher.unref();
  }

  // Unref'd polling fallback (500ms) that does not block process termination
  let lastMtime = 0;
  const pollInterval = setInterval(async () => {
    try {
      if (!fs.existsSync(SIGNAL_FILE)) return;
      const stat = fs.statSync(SIGNAL_FILE);
      if (stat.mtimeMs !== lastMtime) {
        lastMtime = stat.mtimeMs;
        await handleSignal();
      }
    } catch (e) {}
  }, 500);
  if (pollInterval && typeof pollInterval.unref === "function") {
    pollInterval.unref();
  }
} catch (e) {
  console.warn("[RateLimit] Operational signal file watcher could not be started:", e.message);
}

