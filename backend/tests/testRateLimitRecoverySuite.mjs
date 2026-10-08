import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

const MONGO_URI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Campus-Sync";
const JWT_SECRET = process.env.JWT_SECRET;
const TEST_PORT = 5888;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const results = [];
function record(testNumber, testName, passed, details) {
  results.push({ testNumber, testName, passed, details });
  const status = passed ? " PASS " : " FAIL ";
  console.log(`[${status}] Test ${testNumber}: ${testName} -> ${details}`);
}

async function run() {
  console.log("================================================================================");
  console.log("       SUPERADMIN RATE-LIMIT RECOVERY VERIFICATION SUITE                        ");
  console.log("================================================================================\n");

  // 1. Connect Mongoose
  await mongoose.connect(MONGO_URI, { dbName: "Campus_Sync" });
  console.log("Connected to MongoDB.");

  // Import app dynamically
  const { default: app } = await import("../app.js");

  // Start HTTP Server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, "127.0.0.1", resolve));
  console.log(`Test server running on ${BASE_URL}\n`);

  // Reset rate limits cleanly before starting
  const { resetAllRateLimits } = await import("../middlewares/rateLimiter.js");
  await resetAllRateLimits();

  // Load user records
  const Admin = mongoose.models.Admin;
  const Student = mongoose.models.Student;
  const Teacher = mongoose.models.Teacher;

  let superAdminUser = await Admin.findOne({ email: "admin@campus-sync.com" });
  if (!superAdminUser) {
    superAdminUser = await Admin.findOne({ isSuperAdmin: true }) || await Admin.findOne({});
  }
  let regularAdmin = await Admin.findOne({ email: { $ne: "admin@campus-sync.com" }, isSuperAdmin: { $ne: true } });
  if (!regularAdmin) {
    // Temporary standard admin for test
    regularAdmin = await Admin.create({
      name: "Standard Admin",
      email: "standard.admin.test@campussync.edu.in",
      password: "hashedpassword123",
      role: "admin",
      isSuperAdmin: false,
    });
  }

  const studentUser = await Student.findOne({});
  const teacherUser = await Teacher.findOne({});

  const superAdminToken = jwt.sign(
    { id: superAdminUser._id.toString(), role: "admin" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const regularAdminToken = jwt.sign(
    { id: regularAdmin._id.toString(), role: "admin" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const studentToken = jwt.sign(
    { id: studentUser._id.toString(), role: "student" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const teacherToken = jwt.sign(
    { id: teacherUser._id.toString(), role: "teacher" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // -------------------------------------------------------------------------
  // TEST 1: Exceeding login limit -> HTTP 429
  // -------------------------------------------------------------------------
  {
    let got429 = false;
    let responseData = null;
    for (let i = 0; i < 35; i++) {
      const res = await fetch(`${BASE_URL}/api/v1/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test.student@domain.com", password: "wrong" }),
      });
      if (res.status === 429) {
        got429 = true;
        responseData = await res.json();
        break;
      }
    }
    const passed = got429 && responseData?.success === false && responseData?.retryAfter > 0;
    record(
      1,
      "User exceeds login limit -> HTTP 429 with Retry-After",
      passed,
      `Status 429: ${got429}, Message: "${responseData?.message}", retryAfter: ${responseData?.retryAfter}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 2: Unauthenticated request cannot reset rate limit
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE_URL}/api/v1/admin/master/rate-limit/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const passed = res.status === 401;
    record(
      2,
      "Unauthenticated request cannot reset rate limit",
      passed,
      `Received HTTP ${res.status} (expected 401 Unauthorized)`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 3: Regular Admin cannot reset rate limit (Requires Superadmin)
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE_URL}/api/v1/admin/master/rate-limit/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${regularAdminToken}`,
      },
      body: JSON.stringify({}),
    });
    const passed = res.status === 403;
    record(
      3,
      "Regular Admin cannot reset rate limit",
      passed,
      `Received HTTP ${res.status} (expected 403 Forbidden)`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 4: Teacher cannot reset rate limit
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE_URL}/api/v1/admin/master/rate-limit/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({}),
    });
    const passed = res.status === 403;
    record(
      4,
      "Teacher cannot reset rate limit",
      passed,
      `Received HTTP ${res.status} (expected 403 Forbidden)`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 5: Student cannot reset rate limit
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE_URL}/api/v1/admin/master/rate-limit/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({}),
    });
    const passed = res.status === 403;
    record(
      5,
      "Student cannot reset rate limit",
      passed,
      `Received HTTP ${res.status} (expected 403 Forbidden)`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 6: Body-supplied email identity is never trusted for authorization
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE_URL}/api/v1/admin/master/rate-limit/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ email: "admin@campus-sync.com", adminEmail: "admin@campus-sync.com" }),
    });
    const passed = res.status === 403;
    record(
      6,
      "Body-supplied Superadmin email in non-superadmin request is rejected",
      passed,
      `Received HTTP ${res.status} (expected 403 Forbidden)`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 7: Authenticated Superadmin can reset their own limiter
  // -------------------------------------------------------------------------
  {
    // The IP 127.0.0.1 is currently rate-limited from Test 1.
    // Call reset endpoint with superAdminToken
    const resReset = await fetch(`${BASE_URL}/api/v1/admin/master/rate-limit/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({}),
    });
    const dataReset = await resReset.json();

    // Verify login is now permitted again (returns 400 invalid credentials, NOT 429)
    const resLogin = await fetch(`${BASE_URL}/api/v1/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test.student@domain.com", password: "wrong" }),
    });

    const passed = resReset.status === 200 && dataReset.success === true && resLogin.status !== 429;
    record(
      7,
      "Authenticated Superadmin can reset their own limiter",
      passed,
      `Reset Status: ${resReset.status}, Login Status After Reset: ${resLogin.status} (expected != 429)`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 8: Server-side recovery procedure when Superadmin is locked out
  // -------------------------------------------------------------------------
  {
    // Re-lock 127.0.0.1 by exhausting quota
    for (let i = 0; i < 35; i++) {
      await fetch(`${BASE_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@campus-sync.com", password: "wrong" }),
      });
    }

    // Verify 127.0.0.1 is blocked by 429
    const checkLocked = await fetch(`${BASE_URL}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@campus-sync.com", password: "wrong" }),
    });
    const wasLocked = checkLocked.status === 429;

    // Trigger server-side operational recovery via .rate_limit_reset_signal
    const signalPath = path.join(__dirname, "..", ".rate_limit_reset_signal");
    fs.writeFileSync(signalPath, `reset-${Date.now()}\n`, "utf8");

    // Wait 1.5s for the local file watcher to detect signal and clear store
    await new Promise((r) => setTimeout(r, 1500));

    // Check login now passes rate limiter (returns 400 invalid credentials, not 429!)
    const checkUnlocked = await fetch(`${BASE_URL}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@campus-sync.com", password: "wrong" }),
    });
    const nowUnlocked = checkUnlocked.status !== 429;

    const passed = wasLocked && nowUnlocked;
    record(
      8,
      "Server-side operational recovery unblocks rate-limited Superadmin without HTTP bypass",
      passed,
      `Was Locked (429): ${wasLocked}, Now Unlocked: ${nowUnlocked} (status: ${checkUnlocked.status})`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 9: Rate limiting remains active after recovery
  // -------------------------------------------------------------------------
  {
    // Send 35 requests again to verify rate limiter is still enforcing protection
    let reached429Again = false;
    for (let i = 0; i < 35; i++) {
      const res = await fetch(`${BASE_URL}/api/v1/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test.student@domain.com", password: "wrong" }),
      });
      if (res.status === 429) {
        reached429Again = true;
        break;
      }
    }
    const passed = reached429Again;
    record(
      9,
      "Rate limiting remains fully active after recovery",
      passed,
      `Rate limiting re-triggered properly: ${reached429Again}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 10: No rate-limit bypass is introduced
  // -------------------------------------------------------------------------
  {
    // Ensure that even requests sending superadmin email receive 429 once locked
    const resSuperAdminLogin = await fetch(`${BASE_URL}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@campus-sync.com", password: "any" }),
    });
    const passed = resSuperAdminLogin.status === 429;
    record(
      10,
      "No email or IP bypass: Superadmin email cannot bypass rate limiting",
      passed,
      `Status for superadmin login attempt while network is limited: ${resSuperAdminLogin.status} (expected 429)`
    );
  }

  // Clean up
  await resetAllRateLimits();
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();

  console.log("\n================================================================================");
  const allPassed = results.every((r) => r.passed);
  console.log(`FINAL RESULT: ${results.filter((r) => r.passed).length}/${results.length} TESTS PASSED`);
  console.log(`VERDICT: ${allPassed ? "SUCCESS - ALL TESTS PASSED" : "FAILURE - SOME TESTS FAILED"}`);
  console.log("================================================================================\n");

  process.exit(allPassed ? 0 : 1);
}

run().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
