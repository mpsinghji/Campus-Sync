import mongoose from "mongoose";

const ipSecurityEventSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ipVersion: {
      type: String,
      enum: ["v4", "v6"],
      default: "v4",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "REQUEST",
        "LOGIN_SUCCESS",
        "LOGIN_FAILURE",
        "OTP_REQUEST",
        "OTP_FAILURE",
        "OTP_SUCCESS",
        "RATE_LIMIT_TRIGGERED",
        "ACCESS_DENIED",
        "UNAUTHORIZED_REQUEST",
        "SUSPICIOUS_REQUEST",
        "IP_TEMP_BLOCKED",
        "IP_PERMANENT_BANNED",
        "IP_UNBLOCKED",
        "IP_UNBANNED",
        "SUPERADMIN_IP_ACTION",
      ],
    },
    method: {
      type: String,
      default: "",
      trim: true,
    },
    path: {
      type: String,
      default: "",
      trim: true,
    },
    statusCode: {
      type: Number,
      default: 200,
      index: true,
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    accountId: {
      type: String,
      default: null,
      trim: true,
    },
    accountRole: {
      type: String,
      default: null,
      trim: true,
    },
    accountEmail: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
    requestId: {
      type: String,
      default: "",
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for IP analysis & live SOC queries
ipSecurityEventSchema.index({ ip: 1, timestamp: -1 });
ipSecurityEventSchema.index({ eventType: 1, timestamp: -1 });
ipSecurityEventSchema.index({ accountEmail: 1, timestamp: -1 });

const IpSecurityEvent = mongoose.model("IpSecurityEvent", ipSecurityEventSchema);
export default IpSecurityEvent;
