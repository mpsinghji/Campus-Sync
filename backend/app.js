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

import Razorpay from "razorpay";
import Fee from "./models/feeModel.js";
import mongoose from "mongoose";

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: [process.env.LOCAL_URL, process.env.WEB_URL, "https://mpji-campus-sync.vercel.app", "https://campus-sync-ez7y.onrender.com"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/student", studentRoute);
app.use("/api/v1/teacher", teacherRoute);

app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/library", libraryRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("api/v1/fees", feeRouter);

app.post('/Fees', async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { amount, currency, studentId, academicYear, semester } = req.body;

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "fee_receipt#1",
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);

    // Create Fee record with order ID for tracking
    // We'll update the payment status when payment is completed
    const feeRecord = await Fee.create({
      studentId: studentId || new mongoose.Types.ObjectId(), // Use ObjectId
      amount: amount / 100,
      paymentId: response.id,
      academicYear: academicYear || new Date().getFullYear().toString(),
      semester: semester || "1st Semester", // Default semester
      paymentStatus: 'pending'
    });

    console.log('Fee record created:', feeRecord);

    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
      feeId: feeRecord._id
    })
  } catch (error) {
    console.error('Error in /Fees endpoint:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
})

app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment) {
      return res.status(500).json("Error at razorpay loading");
    }

    // Update fee record with payment status
    let newStatus = 'failed';
    if (payment.status === 'captured' || payment.status === 'authorized') {
      newStatus = 'completed';
    }

    const updateResult = await Fee.findOneAndUpdate(
      { paymentId: paymentId },
      {
        paymentStatus: newStatus,
        PaidAt: new Date()
      },
      { new: true }
    );

    console.log('Payment status update result:', updateResult);
    console.log('Payment status from Razorpay:', payment.status);
    console.log('New status set to:', newStatus);

    res.json({
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      currency: payment.currency
    })
  } catch (error) {
    res.status(500).send("Failed to fetch payment details");
  }
})

// Get student fee payment status
app.get("/student-fees/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
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

app.get("/payments", async (req, res) => {
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
app.post('/update-payment-status', async (req, res) => {
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

export default app;
