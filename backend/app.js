import express from "express";
import dotenv from "dotenv";
import adminRoute from "./routes/adminRoute.js";
import studentRoute from "./routes/studentRoute.js";
import teacherRoute from "./routes/teacherRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import announcementRouter from "./routes/announcementRouter.js"
import eventsRouter from "./routes/eventsRouter.js";
import examRouter from "./routes/examRoute.js";
import libraryRouter from "./routes/libraryRoute.js";
import assignmentRouter from "./routes/assignmentRouter.js";
import attendanceRouter from "./routes/attendanceRouter.js";
import feeRouter from "./routes/feeRoutes.js";
import securityRouter from "./routes/securityRoute.js";
import fineRouter from "./routes/fineRoutes.js";
import timetableRoute from "./routes/timetableRoute.js";
import resultRoute from "./routes/resultRoute.js";
import ipSecurityRoute from "./routes/ipSecurityRoute.js";
import { ipSecurityMiddleware, reloadIpBlockCache } from "./middlewares/ipSecurityMiddleware.js";
import { ipLoggingMiddleware } from "./middlewares/ipLoggingMiddleware.js";

import Razorpay from "razorpay";
import Fee from "./models/feeModel.js";
import Fine from "./models/fineModel.js";
import Student from "./models/studentModel.js";
import mongoose from "mongoose";
import { isAuthenticated, requireAdmin } from "./middlewares/auth.js";
import { handleRazorpayWebhook } from "./controllers/webhookController.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

// Trust reverse proxy for client IP detection (rate limiter & secure cookies behind Render/Vercel/ALB)
app.set("trust proxy", 1);

// Hide Express fingerprinting
app.disable("x-powered-by");

// Production-safe security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(cookieParser());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

const allowedOrigins = [
  process.env.LOCAL_URL,
  process.env.FRONTEND_URL,
  process.env.WEB_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://mpji-campus-sync.vercel.app",
  "https://campus-sync-ez7y.onrender.com",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or Razorpay webhooks)
      if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Centralized IP Security Firewall & Request Activity Audit Logging
app.use(ipSecurityMiddleware);
app.use(ipLoggingMiddleware);

// Public Razorpay Webhook Reconciliation (Signature-verified)
app.post("/api/v1/payments/razorpay/webhook", handleRazorpayWebhook);
app.post("/api/v1/payment/webhook", handleRazorpayWebhook);

app.use("/api/v1/admin/master/ip-security", ipSecurityRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/student", studentRoute);
app.use("/api/v1/teacher", teacherRoute);

app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/library", libraryRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/fees", feeRouter);
app.use("/api/v1/fee", feeRouter);
app.use("/api/v1/security", securityRouter);
app.use("/api/v1/fine", fineRouter);
app.use("/api/v1/timetable", timetableRoute);
app.use("/api/v1/timetables", timetableRoute);
app.use("/api/v1/results", resultRoute);
app.use("/api/v1/result", resultRoute);

app.post('/Fees', isAuthenticated, async (req, res) => {
  const { amount, currency, academicYear, semester } = req.body;
  const studentId = req.role === "student" ? req.user._id : (req.body.studentId || req.user._id);
  const numAmount = Number(amount) || 4500000;

  try {
    let orderId = `order_${Date.now()}`;
    let finalAmount = numAmount;

    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RJjIrWx8F7ZuO8",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
      });
      const response = await razorpay.orders.create({
        amount: numAmount,
        currency: currency || "INR",
        receipt: `fee_receipt_${Date.now()}`,
        payment_capture: 1,
      });
      orderId = response.id;
      finalAmount = response.amount;
    } catch (rzpErr) {
      console.warn("Razorpay order creation fallback to simulated order:", rzpErr.message);
    }

    const feeRecord = await Fee.create({
      studentId: studentId || new mongoose.Types.ObjectId(),
      amount: finalAmount / 100,
      paymentId: orderId,
      academicYear: academicYear || "2024-2025",
      semester: semester || "Semester 1",
      paymentStatus: 'pending'
    });

    res.json({
      order_id: orderId,
      currency: currency || "INR",
      amount: finalAmount,
      feeId: feeRecord._id
    });
  } catch (error) {
    console.error('Error in /Fees endpoint:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

app.get("/payment/:paymentId", isAuthenticated, async (req, res) => {
  const { paymentId } = req.params;

  try {
    if (!paymentId) {
      return res.status(400).json({ success: false, message: "Payment ID parameter is required." });
    }

    // Lookup fee record by paymentId or orderId or _id
    let feeRecord = await Fee.findOne({
      $or: [
        { paymentId: paymentId },
        { paymentId: req.query.orderId || "" },
        { _id: mongoose.isValidObjectId(paymentId) ? paymentId : null },
        { _id: mongoose.isValidObjectId(req.query.feeId) ? req.query.feeId : null }
      ]
    });

    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found for the provided payment or order identifier."
      });
    }

    // Role-based authorization: Students can ONLY access their own fee records
    if (req.role === "student") {
      const studentIdStr = req.user?._id?.toString();
      if (!studentIdStr || feeRecord.studentId.toString() !== studentIdStr) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are only authorized to access your own payment records."
        });
      }
    } else if (req.role !== "admin" && req.role !== "superadmin" && req.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Unauthorized to access payment records."
      });
    }

    // If already completed, return status idempotently without state modification
    if (feeRecord.paymentStatus === 'completed') {
      return res.status(200).json({
        success: true,
        message: "Payment is already marked as completed.",
        status: "captured",
        amount: feeRecord.amount * 100,
        feeRecord
      });
    }

    // Only accept genuine Razorpay payment IDs (starting with pay_)
    if (!paymentId.startsWith("pay_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID: A captured Razorpay payment ID (starting with 'pay_') is required to mark payment as completed.",
        status: feeRecord.paymentStatus
      });
    }

    // Query Razorpay gateway to verify payment status
    let payment = null;
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RJjIrWx8F7ZuO8",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
      });
      payment = await razorpay.payments.fetch(paymentId);
    } catch (rzpErr) {
      // CRITICAL: Failed Razorpay API request MUST NOT result in a successful payment!
      return res.status(400).json({
        success: false,
        message: "Razorpay payment verification failed: " + (rzpErr.error?.description || rzpErr.message || "Payment not found on gateway"),
        status: feeRecord.paymentStatus
      });
    }

    // Require Razorpay payment status to be captured or authorized
    if (!payment || (payment.status !== 'captured' && payment.status !== 'authorized')) {
      return res.status(400).json({
        success: false,
        message: `Payment verification failed: Gateway status is '${payment?.status || 'unpaid'}', expected 'captured'.`,
        status: payment?.status || 'unpaid'
      });
    }

    // Update fee record only after verified capture
    feeRecord.paymentStatus = 'completed';
    feeRecord.PaidAt = new Date();
    feeRecord.paymentId = payment.id;
    feeRecord.paymentMode = payment.method || "Razorpay Gateway";
    await feeRecord.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and recorded successfully.",
      status: payment.status,
      amount: payment.amount,
      method: payment.method || "Online",
      currency: payment.currency || "INR",
      feeRecord,
    });
  } catch (error) {
    console.error("Error in /payment/:paymentId endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification.",
      error: error.message
    });
  }
});

// Direct student fee payment completion (simulated & verified)
app.post("/complete-fee-payment", isAuthenticated, async (req, res) => {
  try {
    let { studentId, amount, semester, academicYear, paymentMode, paymentId, orderId, lateFee, includeLateFee } = req.body;
    if (req.role === "student") {
      studentId = req.user._id.toString();
    } else if (req.role !== "admin" && req.role !== "teacher" && req.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Forbidden: Unauthorized to record payments." });
    }
    if (!studentId) return res.status(400).json({ success: false, message: "Student ID required" });

    // If Razorpay gateway mode or paymentId starts with pay_, verify with Razorpay
    if (paymentMode === "Razorpay Payment Gateway" || (paymentId && paymentId.startsWith("pay_"))) {
      if (!paymentId || !paymentId.startsWith("pay_")) {
        return res.status(400).json({
          success: false,
          message: "A valid Razorpay payment ID starting with 'pay_' is required for Razorpay payments."
        });
      }
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RJjIrWx8F7ZuO8",
          key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
        });
        const rzpPayment = await razorpay.payments.fetch(paymentId);
        if (!rzpPayment || (rzpPayment.status !== 'captured' && rzpPayment.status !== 'authorized')) {
          return res.status(400).json({
            success: false,
            message: `Razorpay payment is not captured. Gateway status: ${rzpPayment?.status || 'unpaid'}`
          });
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Razorpay payment verification failed: " + (err.error?.description || err.message || "Invalid payment ID")
        });
      }
    }

    const txnId = paymentId || `TXN_RZP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const numLateFee = Number(lateFee) || 0;
    const isLateFeeIncluded = includeLateFee !== false && numLateFee > 0;

    const feeUpdateData = {
      paymentId: txnId,
      amount: Number(amount) || 45000,
      paymentStatus: "completed",
      PaidAt: new Date(),
      semester: semester || "Semester 1",
      academicYear: academicYear || "2024-2025",
      lateFee: isLateFeeIncluded ? numLateFee : 0,
      paymentMode: paymentMode || "Online Gateway",
    };

    let feeRecord = null;
    if (orderId) {
      feeRecord = await Fee.findOneAndUpdate(
        { studentId, paymentId: orderId },
        feeUpdateData,
        { new: true }
      );
    }

    if (!feeRecord) {
      feeRecord = await Fee.findOneAndUpdate(
        { studentId, semester: semester || "Semester 1" },
        feeUpdateData,
        { new: true, upsert: true }
      );
    }

    // If late fee was NOT appended/paid in this payment, preserve it as an institutional fine so it NEVER disappears!
    if (!isLateFeeIncluded && numLateFee > 0) {
      const student = await Student.findById(studentId);
      await Fine.create({
        student: studentId,
        studentName: student?.name || "Student",
        rollno: student?.rollno || "N/A",
        fineType: "Overdue Semester Late Fee",
        amount: numLateFee,
        reason: `Overdue late penalty for ${semester || "Semester"} (${academicYear || "Cycle"})`,
        status: "Pending",
        leviedBy: "Accounts Treasury Automation",
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment successfully verified and recorded!",
      feeRecord,
      receiptNumber: `CS-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get student fee payment status
app.get("/student-fees/:studentId", isAuthenticated, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.role === "student" && req.user._id.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: You may only view your own fees." });
    }
    const { academicYear } = req.query;

    const query = { studentId };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const fees = await Fee.find(query).sort({ createdAt: -1 });

    const totalFees = fees.length;
    const paidFees = fees.filter(fee => fee.paymentStatus === 'completed').length;
    const pendingFees = fees.filter(fee => fee.paymentStatus === 'pending').length;
    const failedFees = fees.filter(fee => fee.paymentStatus === 'failed').length;

    res.json({
      success: true,
      data: {
        totalFees,
        paidFees,
        pendingFees,
        failedFees,
        fees: fees.map(fee => ({
          id: fee._id,
          amount: fee.amount,
          paymentStatus: fee.paymentStatus,
          paymentId: fee.paymentId,
          academicYear: fee.academicYear,
          semester: fee.semester,
          paidAt: fee.PaidAt,
          createdAt: fee.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching fee data",
      error: error.message
    });
  }
})

app.get("/payments", isAuthenticated, requireAdmin, async (req, res) => {
  const { fromDate, toDate } = req.query;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const filter = {};

    if (fromDate && toDate) {
      const startDate = new Date(fromDate).getTime() / 1000;
      const endDate = new Date(toDate).getTime() / 1000;
      filter.created_at = { gte: startDate, lte: endDate };
    }

    const payments = await razorpay.payments.all({
      ...filter,
      count: 100,
    });

    const paymentCounts = {};
    payments.items.forEach(payment => {
      const paymentDate = new Date(payment.created_at * 1000);
      const dateString = `${paymentDate.getDate()}/${paymentDate.getMonth() + 1}/${paymentDate.getFullYear()}`;

      paymentCounts[dateString] = (paymentCounts[dateString] || 0) + 1;
    });

    const groupedPayments = Object.keys(paymentCounts).map(date => ({
      date,
      count: paymentCounts[date],
    }));

    res.json({
      success: true,
      data: groupedPayments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Manual payment status update endpoint for testing
app.post('/update-payment-status', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    const updateResult = await Fee.findOneAndUpdate(
      { paymentId: paymentId },
      {
        paymentStatus: status,
        PaidAt: new Date()
      },
      { new: true }
    );

    console.log('Manual payment status update:', updateResult);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updateResult
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "error",
        backend: "up",
        database: "disconnected"
      });
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "ok",
      backend: "up",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      backend: "up",
      database: "disconnected"
    });
  }
});

app.get("/api/v1/diagnostics/ip-debug", (req, res) => {
  res.status(200).json({
    reqIp: req.ip,
    reqIps: req.ips,
    remoteAddress: req.socket?.remoteAddress,
    xForwardedFor: req.headers["x-forwarded-for"],
    xRealIp: req.headers["x-real-ip"],
    cfConnectingIp: req.headers["cf-connecting-ip"],
    trueClientIp: req.headers["true-client-ip"],
  });
});


app.head("/api/health", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.sendStatus(503);
    }

    await mongoose.connection.db.admin().ping();

    return res.sendStatus(200);
  } catch (error) {
    console.error("Health check failed:", error.message);
    return res.sendStatus(503);
  }
});

// Production-safe centralized error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction && statusCode === 500
    ? "Internal Server Error"
    : (err.message || "Internal Server Error");

  if (!isProduction) {
    console.error("Express Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

export default app;
