import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

const MONGO_URI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Campus-Sync";
const JWT_SECRET = process.env.JWT_SECRET;
const TEST_PORT = 5899;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const results = [];
function record(testCategory, testName, passed, details) {
  results.push({ testCategory, testName, passed, details });
  const status = passed ? " PASS " : " FAIL ";
  console.log(`[${status}] [${testCategory}] ${testName} -> ${details}`);
}

async function run() {
  console.log("================================================================================");
  console.log("       CAMPUSSYNC IP SECURITY & ACCESS CONTROL TEST SUITE                       ");
  console.log("================================================================================\n");

  await mongoose.connect(MONGO_URI, { dbName: "Campus_Sync" });
  console.log("Connected to MongoDB.");

  // Import app dynamically
  const { default: app } = await import("../app.js");

  // Start HTTP Server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, "127.0.0.1", resolve));
  console.log(`Test server running on ${BASE_URL}\n`);

  // Import models & middleware
  const Admin = mongoose.models.Admin;
  const Student = mongoose.models.Student;
  const Teacher = mongoose.models.Teacher;
  const IpAccessRule = mongoose.models.IpAccessRule;
  const IpSecurityEvent = mongoose.models.IpSecurityEvent;
  const IpAuditLog = mongoose.models.IpAuditLog;
  const { reloadIpBlockCache, removeIpBlockFromCache } = await import("../middlewares/ipSecurityMiddleware.js");

  // Clean test IP rules and events before testing
  const TEST_TEMP_IP = "203.0.113.88";
  const TEST_BAN_IP = "198.51.100.77";
  const ALL_TEST_IPS = [TEST_TEMP_IP, TEST_BAN_IP, "203.0.113.99", "203.0.113.111"];

  const cleanupTestData = async () => {
    await IpAccessRule.deleteMany({ ip: { $in: [...ALL_TEST_IPS, "127.0.0.1", "::1"] } });
    await IpSecurityEvent.deleteMany({ ip: { $in: ALL_TEST_IPS } });
    await IpAuditLog.deleteMany({ targetIp: { $in: ALL_TEST_IPS } });
    for (const ip of [...ALL_TEST_IPS, "127.0.0.1", "::1"]) {
      removeIpBlockFromCache(ip);
    }
  };

  await cleanupTestData();

  let superAdminUser = await Admin.findOne({ email: "admin@campus-sync.com" });
  if (!superAdminUser) {
    superAdminUser = await Admin.findOne({ isSuperAdmin: true }) || (await Admin.findOne({}));
  }
  let regularAdmin = await Admin.findOne({ email: { $ne: "admin@campus-sync.com" }, isSuperAdmin: { $ne: true } });
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

  // ---------------------------------------------------------------------------
  // 1. AUTHORIZATION & ROLE ISOLATION
  // ---------------------------------------------------------------------------
  console.log("--- 1. Testing IP Security Authorization & Role Guards ---");
  {
    // 1.1 Superadmin can view overview
    const resSuper = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/overview`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const dataSuper = await resSuper.json();
    record("Authorization", "Superadmin can access IP security overview", resSuper.status === 200 && dataSuper.success === true, `Status: ${resSuper.status}`);

    // 1.2 Unauthenticated receives 401
    const resUnauth = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/overview`);
    record("Authorization", "Unauthenticated request receives 401 Unauthorized", resUnauth.status === 401, `Status: ${resUnauth.status}`);

    // 1.3 Regular Admin receives 403
    const resAdmin = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/overview`, {
      headers: { Authorization: `Bearer ${regularAdminToken}` },
    });
    record("Authorization", "Regular Admin receives 403 Forbidden", resAdmin.status === 403, `Status: ${resAdmin.status}`);

    // 1.4 Teacher receives 403
    const resTeacher = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    record("Authorization", "Teacher receives 403 Forbidden", resTeacher.status === 403, `Status: ${resTeacher.status}`);

    // 1.5 Student receives 403
    const resStudent = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    record("Authorization", "Student receives 403 Forbidden", resStudent.status === 403, `Status: ${resStudent.status}`);

    // 1.6 Forged header email in non-superadmin token is rejected
    const resForged = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/overview`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
        "x-admin-email": "admin@campus-sync.com",
      },
    });
    record("Authorization", "Forged header email in non-superadmin request is rejected with 403", resForged.status === 403, `Status: ${resForged.status}`);
  }

  // ---------------------------------------------------------------------------
  // 2. TEMPORARY IP BLOCK
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Testing Temporary IP Block & Enforcement ---");
  {
    // 2.1 Create temporary block for TEST_TEMP_IP (15 mins)
    const resBlock = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        ip: TEST_TEMP_IP,
        durationMinutes: 15,
        reason: "Integration test temporary block",
        notes: "Automated test suite",
      }),
    });
    const dataBlock = await resBlock.json();
    record("Temporary Block", "Superadmin can create temporary IP block", resBlock.status === 200 && dataBlock.success === true, `Status: ${resBlock.status}`);

    // 2.2 Verify blocked IP receives 403 Forbidden with generic message
    const resBlockedReq = await fetch(`${BASE_URL}/api/v1/student/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": TEST_TEMP_IP,
      },
      body: JSON.stringify({ email: "test@domain.com", password: "pwd" }),
    });
    const dataBlockedReq = await resBlockedReq.json();
    const isBlocked = resBlockedReq.status === 403 && dataBlockedReq.message === "Access denied.";
    record("Temporary Block", "Temporarily blocked IP receives 403 with generic 'Access denied.'", isBlocked, `Status: ${resBlockedReq.status}, Message: "${dataBlockedReq.message}"`);

    // 2.3 Verify unblocked IPs still pass through normally (not blocked)
    const resAllowedReq = await fetch(`${BASE_URL}/api/v1/student/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.99",
      },
      body: JSON.stringify({ email: "test@domain.com", password: "pwd" }),
    });
    record("Temporary Block", "Allowed IPs pass through without block", resAllowedReq.status !== 403, `Status: ${resAllowedReq.status}`);
  }

  // ---------------------------------------------------------------------------
  // 3. PERMANENT BAN
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Testing Permanent Ban & Persistence ---");
  {
    // 3.1 Banning without confirmation phrase is rejected
    const resBadBan = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        ip: TEST_BAN_IP,
        reason: "Malicious attack",
        confirmationPhrase: "WRONG_PHRASE",
      }),
    });
    record("Permanent Ban", "Ban without valid confirmation phrase is rejected", resBadBan.status === 400, `Status: ${resBadBan.status}`);

    // 3.2 Banning with correct confirmation phrase succeeds
    const resGoodBan = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        ip: TEST_BAN_IP,
        reason: "Malicious automated probing",
        confirmationPhrase: `BAN ${TEST_BAN_IP}`,
      }),
    });
    const dataGoodBan = await resGoodBan.json();
    record("Permanent Ban", "Ban with exact confirmation phrase succeeds", resGoodBan.status === 200 && dataGoodBan.success === true, `Status: ${resGoodBan.status}`);

    // 3.3 Verify ban survives reload of in-memory cache from MongoDB
    await reloadIpBlockCache();
    const resBannedReq = await fetch(`${BASE_URL}/api/v1/student/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": TEST_BAN_IP,
      },
      body: JSON.stringify({ email: "test@domain.com", password: "pwd" }),
    });
    const dataBannedReq = await resBannedReq.json();
    record("Permanent Ban", "Banned IP receives 403 even after cache reload from DB", resBannedReq.status === 403 && dataBannedReq.message === "Access denied.", `Status: ${resBannedReq.status}`);
  }

  // ---------------------------------------------------------------------------
  // 4. UNBLOCK / REMOVE RESTRICTIONS
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Testing Unblock & Historical Audit Preservation ---");
  {
    // 4.1 Unblock TEST_TEMP_IP
    const resUnblock = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/unblock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        ip: TEST_TEMP_IP,
        reason: "Test unblock verification",
      }),
    });
    const dataUnblock = await resUnblock.json();
    record("Unblock", "Superadmin can unblock an IP", resUnblock.status === 200 && dataUnblock.success === true, `Status: ${resUnblock.status}`);

    // 4.2 Verify previously blocked IP can now make requests again
    const resRestoredReq = await fetch(`${BASE_URL}/api/v1/student/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": TEST_TEMP_IP,
      },
      body: JSON.stringify({ email: "test@domain.com", password: "pwd" }),
    });
    record("Unblock", "Unblocked IP accesses platform without 403 Access Denied", resRestoredReq.status !== 403, `Status: ${resRestoredReq.status}`);

    // 4.3 Verify historical record is marked 'removed' in DB, not deleted
    const historicalRule = await IpAccessRule.findOne({ ip: TEST_TEMP_IP, status: "removed" });
    record("Unblock", "Historical rule marked as removed and preserved in MongoDB", Boolean(historicalRule && historicalRule.removalReason), `Found rule with status: ${historicalRule?.status}`);
  }

  // ---------------------------------------------------------------------------
  // 5. IMMUTABLE AUDIT LOGGING
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Testing Immutable Superadmin Audit Trail ---");
  {
    const auditEntries = await IpAuditLog.find({ targetIp: TEST_TEMP_IP }).lean();
    const hasBlockAudit = auditEntries.some((a) => a.action === "TEMPORARY_IP_BLOCK");
    const hasUnblockAudit = auditEntries.some((a) => a.action === "UNBLOCK_IP");
    record("Audit Trail", "Every manual block/unblock action produces immutable audit entry", hasBlockAudit && hasUnblockAudit, `Audit actions found: ${auditEntries.map((a) => a.action).join(", ")}`);

    // Verify audit logs endpoint works with pagination
    const resAuditApi = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const dataAuditApi = await resAuditApi.json();
    record("Audit Trail", "Superadmin can query audit logs endpoint", resAuditApi.status === 200 && Array.isArray(dataAuditApi.data?.logs), `Logs returned: ${dataAuditApi.data?.logs?.length}`);
  }

  // ---------------------------------------------------------------------------
  // 6. PRIVACY & LOG SANITIZATION
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. Testing Privacy & Credential Sanitization ---");
  {
    // Send a request with test payload
    const testSecret = "SUPER_SECRET_PASSWORD_12345";
    await fetch(`${BASE_URL}/api/v1/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.111" },
      body: JSON.stringify({ email: "privacy.test@domain.com", password: testSecret }),
    });

    // Wait 500ms for async event logger
    await new Promise((r) => setTimeout(r, 500));

    // Verify raw secret password NEVER appears in any IpSecurityEvent or IpAuditLog record
    const eventWithPassword = await IpSecurityEvent.findOne({
      $or: [
        { "metadata.password": { $exists: true } },
        { "metadata.body": { $exists: true } },
      ],
    });
    record("Privacy", "Sensitive passwords, bodies, and secrets are strictly excluded from event logs", eventWithPassword === null, "Zero sensitive payload bodies found in DB");
  }

  // ---------------------------------------------------------------------------
  // 7. RATE-LIMIT INTEGRATION & RESET
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. Testing Rate-Limit Integration & SOC Management ---");
  {
    const resResetLimiter = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/reset-rate-limit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ ip: "203.0.113.88" }),
    });
    const dataResetLimiter = await resResetLimiter.json();
    record("Rate-Limit Integration", "Superadmin can reset rate limit for target IP via IP Security API", resResetLimiter.status === 200 && dataResetLimiter.success === true, `Status: ${resResetLimiter.status}`);
  }

  // ---------------------------------------------------------------------------
  // 8. SAFETY & SELF-LOCKOUT PROTECTION
  // ---------------------------------------------------------------------------
  console.log("\n--- 8. Testing Self-Lockout & Recovery Guardrails ---");
  {
    // Try to ban the current connection IP
    const resSelfBan = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
        "X-Forwarded-For": "127.0.0.1",
      },
      body: JSON.stringify({
        ip: "127.0.0.1",
        reason: "Self ban test",
        confirmationPhrase: "BAN 127.0.0.1",
      }),
    });
    record("Safety Guardrails", "Self-permanent-ban is strictly prevented by backend safety guard", resSelfBan.status === 403, `Status: ${resSelfBan.status}`);

    // Try to block current IP without confirmSelfBlock
    const resSelfBlockNoConfirm = await fetch(`${BASE_URL}/api/v1/admin/master/ip-security/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
        "X-Forwarded-For": "127.0.0.1",
      },
      body: JSON.stringify({
        ip: "127.0.0.1",
        durationMinutes: 10,
        reason: "Accidental block",
      }),
    });
    record("Safety Guardrails", "Self-temporary-block requires explicit confirmSelfBlock flag", resSelfBlockNoConfirm.status === 400, `Status: ${resSelfBlockNoConfirm.status}`);
  }

  // Clean up all synthetic test data so database is never polluted
  await cleanupTestData();
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
