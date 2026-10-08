import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  targetEmails: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    default: "",
  },
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
