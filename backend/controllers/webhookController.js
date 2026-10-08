import crypto from "crypto";
import Fee from "../models/feeModel.js";

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing x-razorpay-signature header.",
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Razorpay webhook configuration error: RAZORPAY_WEBHOOK_SECRET is not configured.");
      return res.status(500).json({
        success: false,
        message: "Razorpay webhook secret is not configured on the server.",
      });
    }

    // Verify signature using HMAC-SHA256
    const payloadBody = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    const isMatch =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature.",
      });
    }

    const { event, payload } = req.body || {};
    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;

    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || orderEntity?.id;

    if (!paymentId && !orderId) {
      return res.status(400).json({
        success: false,
        message: "Webhook payload missing payment and order identifiers.",
      });
    }

    // Locate matching Fee record
    const feeRecord = await Fee.findOne({
      $or: [
        { paymentId: paymentId },
        { paymentId: orderId }
      ].filter(q => Object.values(q)[0])
    });

    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found for payment/order identifier.",
      });
    }

    // Handle payment capture / order paid events
    if (event === "payment.captured" || event === "order.paid") {
      const status = paymentEntity?.status || orderEntity?.status;
      if (status !== "captured" && status !== "paid") {
        return res.status(400).json({
          success: false,
          message: `Payment status '${status}' is not captured/paid.`,
        });
      }

      // Idempotent: If already completed, return 200 without duplicate state transition
      if (feeRecord.paymentStatus === "completed") {
        return res.status(200).json({
          success: true,
          message: "Fee payment is already marked as completed (idempotent).",
          feeRecord,
        });
      }

      // Transition to completed
      feeRecord.paymentStatus = "completed";
      feeRecord.PaidAt = new Date();
      feeRecord.paymentId = paymentId || feeRecord.paymentId;
      feeRecord.paymentMode = paymentEntity?.method || "Razorpay Gateway (Webhook Reconciled)";
      await feeRecord.save();

      return res.status(200).json({
        success: true,
        message: "Fee payment successfully reconciled and marked as completed.",
        feeRecord,
      });
    } else if (event === "payment.failed") {
      // Failed payment event does NOT mark fee as completed
      if (feeRecord.paymentStatus !== "completed") {
        feeRecord.paymentStatus = "failed";
        await feeRecord.save();
      }
      return res.status(200).json({
        success: true,
        message: "Payment failure event acknowledged; fee remains uncompleted.",
        feeRecord,
      });
    } else {
      // Other unhandled events: return 200 acknowledgment without modifying DB
      return res.status(200).json({
        success: true,
        message: `Event '${event}' acknowledged; no fee modification required.`,
        feeRecord,
      });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during webhook processing.",
      error: err.message,
    });
  }
};
