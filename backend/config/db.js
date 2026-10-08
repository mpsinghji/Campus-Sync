import mongoose from "mongoose";
import Admin from "../models/adminModel.js";
import { SystemSettings } from "../models/systemSettingsModel.js";

const initializeSystem = async () => {
  try {
    const superAdminEmail = "admin@campus-sync.com";
    let superAdmin = await Admin.findOne({ email: superAdminEmail });
    if (!superAdmin) {
      superAdmin = await Admin.create({
        name: "CampusSync Super Admin",
        email: superAdminEmail,
        password: "admin123",
        phone: "+91 9999999999",
        role: "admin",
        isSuperAdmin: true,
        designation: "Super Admin",
      });
      console.log("Super Admin seeded: admin@campus-sync.com (password: admin123)");
    } else {
      let needsSave = false;
      if (!superAdmin.isSuperAdmin) {
        superAdmin.isSuperAdmin = true;
        needsSave = true;
      }
      if (needsSave) {
        await superAdmin.save();
      }
    }

    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      await SystemSettings.create({
        key: "otp_settings",
        bypassAll: false,
        bypassedEmails: [superAdminEmail],
        secretOtp: "454545",
        secretOtpEnabled: true,
        secretOtpExpiresAt: null,
      });
      console.log("Default OTP settings initialized");
    } else if (!settings.bypassedEmails.includes(superAdminEmail)) {
      settings.bypassedEmails.push(superAdminEmail);
      await settings.save();
    }
  } catch (initErr) {
    console.error("System initialization warning:", initErr.message);
  }
};

const connectdb = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("MONGO_URL is not defined in environment variables.");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "Campus_Sync",
    });

    console.log(`MongoDB connected`);
    await initializeSystem();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectdb;
