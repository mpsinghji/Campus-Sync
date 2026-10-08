import mongoose from "mongoose";

const ipAccessRuleSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cidr: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: ["temporary_block", "permanent_block", "ban", "allow"],
      default: "temporary_block",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired", "removed"],
      default: "active",
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String,
      default: "system",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    removedBy: {
      type: String,
      default: null,
      trim: true,
    },
    removedAt: {
      type: Date,
      default: null,
    },
    removalReason: {
      type: String,
      default: null,
      trim: true,
    },
    source: {
      type: String,
      enum: ["manual", "automatic", "rate_limit", "security_detection"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed rule lookups
ipAccessRuleSchema.index({ ip: 1, status: 1 });
ipAccessRuleSchema.index({ status: 1, expiresAt: 1 });

const IpAccessRule = mongoose.model("IpAccessRule", ipAccessRuleSchema);
export default IpAccessRule;
