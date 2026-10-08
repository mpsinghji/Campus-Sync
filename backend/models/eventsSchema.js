import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    targetAudience: {
      type: String,
      enum: ["all", "students", "teachers", "batch", "section", "bunch_emails"],
      default: "all",
    },
    targetEmails: {
      type: [String],
      default: [],
    },
    batch: { type: String, default: "" },
    section: { type: String, default: "" },
    location: { type: String, default: "Main Campus Auditorium" },
  },
  { timestamps: true }
);

export const Events = mongoose.model("Event", eventSchema);

