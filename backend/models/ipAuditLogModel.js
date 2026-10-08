import mongoose from "mongoose";

const ipAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "TEMPORARY_IP_BLOCK",
        "PERMANENT_BAN",
        "UNBLOCK_IP",
        "REMOVE_BAN",
        "RATE_LIMIT_RESET",
        "EMERGENCY_BLOCK",
      ],
      index: true,
    },
    targetIp: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    performedBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    performedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "Permanent",
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    result: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ipAuditLogSchema.index({ targetIp: 1, timestamp: -1 });

const IpAuditLog = mongoose.model("IpAuditLog", ipAuditLogSchema);
export default IpAuditLog;
