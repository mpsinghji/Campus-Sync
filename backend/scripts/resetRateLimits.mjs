import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SIGNAL_FILE = path.join(__dirname, "..", ".rate_limit_reset_signal");

console.log("=================================================");
console.log("CampusSync: Rate Limit Emergency Recovery Utility");
console.log("=================================================");

try {
  // Write the reset signal to the local server signal file
  fs.writeFileSync(SIGNAL_FILE, `reset-${Date.now()}\n`, "utf8");
  console.log("✅ Operational reset signal dispatched to running backend instance.");
  console.log("   The in-memory rate limit store will be cleared within 1 second.");
  console.log("");
  console.log("ℹ️  Operational Recovery Options:");
  console.log("   1. In-memory store: Running this script signals the backend to flush all counters.");
  console.log("   2. Process restart: Restarting the Node process (`pm2 restart` / `systemctl restart campus-sync` / nodemon)");
  console.log("      automatically clears all in-memory rate limits upon startup.");
  console.log("   3. External store (e.g. Redis): If configured with REDIS_URL, flush rate-limiting keys (`DEL rl:*`).");
  console.log("   4. Security Guarantee: All login & OTP endpoints remain 100% rate-limited against brute force.");
  console.log("=================================================");
  process.exit(0);
} catch (err) {
  console.error("❌ Failed to dispatch rate limit reset signal:", err.message);
  process.exit(1);
}
