import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    studentRollno: {
      type: String,
      trim: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
      default: "Semester 1",
    },
    academicYear: {
      type: String,
      trim: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    examName: {
      type: String,
      trim: true,
      default: "Semester Examination",
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
      min: 1,
    },
    grade: {
      type: String,
      trim: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
    },
    gradePoints: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Calculate automatic grade and grade points if not provided
resultSchema.pre("save", function (next) {
  const percentage = (this.marksObtained / this.totalMarks) * 100;
  if (!this.grade) {
    if (percentage >= 90) this.grade = "A+";
    else if (percentage >= 80) this.grade = "A";
    else if (percentage >= 70) this.grade = "B+";
    else if (percentage >= 60) this.grade = "B";
    else if (percentage >= 50) this.grade = "C";
    else if (percentage >= 40) this.grade = "P";
    else this.grade = "F";
  }

  if (this.grade === "A+") this.gradePoints = 10;
  else if (this.grade === "A") this.gradePoints = 9;
  else if (this.grade === "B+") this.gradePoints = 8;
  else if (this.grade === "B") this.gradePoints = 7;
  else if (this.grade === "C") this.gradePoints = 6;
  else if (this.grade === "P") this.gradePoints = 4;
  else this.gradePoints = 0;

  next();
});

export const Result = mongoose.model("Result", resultSchema);
export default Result;
