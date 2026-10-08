import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

async function migrate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URL, { dbName: "Campus_Sync" });

  const IpSecurityEvent = (await import("../models/ipSecurityEventModel.js")).default;
  const events = await IpSecurityEvent.find({ ip: /^10\./ });

  console.log(`Found ${events.length} security events with internal 10.x.x.x addresses.`);

  let migratedUserEvents = 0;
  let markedProbeEvents = 0;

  for (const event of events) {
    const isProbe = event.userAgent?.includes("UptimeRobot");
    const meta = event.metadata || {};

    meta.originalExtractedIp = event.ip;
    meta.migratedFromInternalIp = true;
    meta.proxyIp = event.ip;

    if (isProbe) {
      meta.isMonitoringProbe = true;
      event.metadata = meta;
      await event.save();
      markedProbeEvents++;
    } else {
      // Genuine user request from the laptop/browser that was misattributed to Render's internal proxy
      event.ip = "59.89.191.54";
      event.metadata = meta;
      await event.save();
      migratedUserEvents++;
    }
  }

  console.log(`Migration completed:`);
  console.log(`- ${migratedUserEvents} user session events migrated to external client IP (59.89.191.54) with audit trail preserved.`);
  console.log(`- ${markedProbeEvents} monitoring probe events annotated with proxy metadata.`);

  const remaining10x = await IpSecurityEvent.countDocuments({ ip: /^10\./ });
  console.log(`Remaining 10.x user events: ${remaining10x} (only monitoring probes if any).`);

  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
