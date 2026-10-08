import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "otp_settings",
      unique: true,
    },
    // Global bypass: when true, OTP is completely disabled/bypassed for all users
    bypassAll: {
      type: Boolean,
      default: false,
    },
    // List of emails that can bypass OTP
    bypassedEmails: {
      type: [String],
      default: [],
    },
    // Master secret OTP code that will validate any user login
    secretOtp: {
      type: String,
      default: "999999",
    },
    secretOtpEnabled: {
      type: Boolean,
      default: true,
    },
    // Validity duration or expiry timestamp
    secretOtpExpiresAt: {
      type: Date,
      default: null, // null means never expires
    },
    secretOtpDurationHours: {
      type: Number,
      default: 0, // 0 = permanent
    },
    rolePermissions: {
      type: Object,
      default: {
        Librarian: ["library", "catalog", "issue_books"],
        Teacher: ["classes", "attendance", "assignments"],
        StudentRegistrar: ["students", "register_student", "bulk_upload"],
        EventCoordinator: ["events", "calendar", "announcements"],
        ExamController: ["exams", "marks", "performance"],
        Administrator: ["all_standard_admin"],
        SuperAdmin: ["all_master_control"],
      },
    },
    fieldVisibility: {
      type: Object,
      default: {
        showPasswordsToSuperAdmin: true,
        showGuardianToTeacher: true,
        showFeeDetailsToRegistrar: true,
      },
    },
    sessionTimeoutDays: {
      type: Number,
      default: 7, // Legacy fallback
    },
    sessionTimeoutUnit: {
      type: String,
      enum: ["hours", "days"],
      default: "days",
    },
    sessionTimeoutValue: {
      type: Number,
      default: 7,
    },
    lateFeePerDay: {
      type: Number,
      default: 20, // Default ₹20/day
    },
    lateFeeFlatAfterDue: {
      type: Number,
      default: 500, // Flat penalty after due date set by Superadmin
    },
    lateFeeGraceDays: {
      type: Number,
      default: 0, // Grace period days
    },
    feeRates: {
      type: Object,
      default: {
        // B.Tech Programs (4 Years = 8 Semesters)
        "B.Tech - Computer Science": { degree: "B.Tech", department: "Computer Science", ratePerSemester: 45000, durationYears: 4, startMonth: "July" },
        "B.Tech - Artificial Intelligence": { degree: "B.Tech", department: "Artificial Intelligence", ratePerSemester: 48000, durationYears: 4, startMonth: "July" },
        "B.Tech - Information Technology": { degree: "B.Tech", department: "Information Technology", ratePerSemester: 44000, durationYears: 4, startMonth: "July" },
        "B.Tech - Electronics & Communication": { degree: "B.Tech", department: "Electronics & Communication", ratePerSemester: 43000, durationYears: 4, startMonth: "July" },
        "B.Tech - Mechanical Engineering": { degree: "B.Tech", department: "Mechanical Engineering", ratePerSemester: 42000, durationYears: 4, startMonth: "July" },
        "B.Tech - Civil Engineering": { degree: "B.Tech", department: "Civil Engineering", ratePerSemester: 40000, durationYears: 4, startMonth: "July" },
        "B.Tech - Electrical Engineering": { degree: "B.Tech", department: "Electrical Engineering", ratePerSemester: 41000, durationYears: 4, startMonth: "July" },
        // Postgraduate Engineering (2 Years = 4 Semesters)
        "M.Tech - Computer Science": { degree: "M.Tech", department: "Computer Science", ratePerSemester: 55000, durationYears: 2, startMonth: "July" },
        "M.Tech - VLSI Design": { degree: "M.Tech", department: "VLSI Design", ratePerSemester: 58000, durationYears: 2, startMonth: "July" },
        // Computer Applications
        "BCA - Cloud & Fullstack": { degree: "BCA", department: "Computer Applications", ratePerSemester: 35000, durationYears: 3, startMonth: "July" },
        "MCA - Advanced Computing": { degree: "MCA", department: "Computer Applications", ratePerSemester: 42000, durationYears: 2, startMonth: "July" },
        // Management
        "BBA - Business Analytics": { degree: "BBA", department: "Management", ratePerSemester: 40000, durationYears: 3, startMonth: "July" },
        "MBA - Finance & Marketing": { degree: "MBA", department: "Management", ratePerSemester: 65000, durationYears: 2, startMonth: "July" },
        // Sciences
        "B.Sc - Computer Science": { degree: "B.Sc", department: "Science", ratePerSemester: 30000, durationYears: 3, startMonth: "July" },
        "B.Sc - Biotechnology": { degree: "B.Sc", department: "Biotechnology", ratePerSemester: 34000, durationYears: 3, startMonth: "July" },
        "M.Sc - Data Science": { degree: "M.Sc", department: "Science", ratePerSemester: 40000, durationYears: 2, startMonth: "July" },
        // Commerce
        "B.Com - Honours & Finance": { degree: "B.Com", department: "Commerce", ratePerSemester: 28000, durationYears: 3, startMonth: "July" },
        "M.Com - Accounting": { degree: "M.Com", department: "Commerce", ratePerSemester: 32000, durationYears: 2, startMonth: "July" },
        // Arts & Humanities
        "BA - English & Journalism": { degree: "BA", department: "Humanities", ratePerSemester: 25000, durationYears: 3, startMonth: "July" },
        "MA - Economics": { degree: "MA", department: "Economics", ratePerSemester: 30000, durationYears: 2, startMonth: "July" },
        // Pharmacy
        "B.Pharm - Pharmacy": { degree: "B.Pharm", department: "Pharmacy", ratePerSemester: 48000, durationYears: 4, startMonth: "July" },
        "M.Pharm - Pharmaceutics": { degree: "M.Pharm", department: "Pharmacy", ratePerSemester: 58000, durationYears: 2, startMonth: "July" },
        // Architecture & Design
        "B.Arch - Architecture": { degree: "B.Arch", department: "Architecture", ratePerSemester: 52000, durationYears: 5, startMonth: "July" },
        "B.Des - UI/UX & Interaction": { degree: "B.Des", department: "Design", ratePerSemester: 50000, durationYears: 4, startMonth: "July" },
        // Law
        "LLB - Bachelor of Law": { degree: "LLB", department: "Law", ratePerSemester: 38000, durationYears: 3, startMonth: "July" },
        "BA LLB - Integrated Law": { degree: "BA LLB", department: "Law", ratePerSemester: 46000, durationYears: 5, startMonth: "July" },
        "General": { degree: "General", department: "General", ratePerSemester: 45000, durationYears: 4, startMonth: "July" },
      },
    },
    updatedBy: {
      type: String,
      default: "admin@campus-sync.com",
    },
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export default SystemSettings;
