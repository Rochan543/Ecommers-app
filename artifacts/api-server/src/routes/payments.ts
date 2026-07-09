import crypto from "node:crypto";
import { Router } from "express";
import Razorpay from "razorpay";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// POST /api/payments/create-order
router.post("/create-order", authMiddleware, async (req: AuthRequest, res) => {
  const { orderId } = req.body as { orderId?: string };

  if (!orderId) {
    res.status(400).json({ message: "orderId is required" });
    return;
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.userId },
  });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  try {
    const razorpay = getRazorpay();
    const amountInPaise = Math.round(order.total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
    });

    // Save payment record
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        currency: "INR",
      },
      update: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      currency: "INR",
      keyId: process.env["RAZORPAY_KEY_ID"],
    });
  } catch (err) {
    req.log?.error({ err }, "Razorpay order creation failed");
    res.status(500).json({ message: "Payment initialization failed" });
  }
});

// POST /api/payments/verify
router.post("/verify", authMiddleware, async (req: AuthRequest, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
    req.body as {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      orderId?: string;
    };

  if (
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature ||
    !orderId
  ) {
    res.status(400).json({ message: "Missing payment verification fields" });
    return;
  }

  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) {
    res.status(500).json({ message: "Razorpay not configured" });
    return;
  }

  // Verify HMAC signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ message: "Invalid payment signature" });
    return;
  }

  // Verify the order belongs to the authenticated user and the stored razorpayOrderId matches
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) {
    res.status(404).json({ message: "Payment record not found" });
    return;
  }
  if (payment.razorpayOrderId !== razorpayOrderId) {
    res.status(400).json({ message: "Razorpay order ID mismatch" });
    return;
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.userId },
  });
  if (!order) {
    res.status(403).json({ message: "Order not found or access denied" });
    return;
  }

  // Update payment and order, clear cart
  const cart = await prisma.cart.findUnique({ where: { userId: req.userId } });
  await Promise.all([
    prisma.payment.update({
      where: { orderId },
      data: { razorpayPaymentId, status: "paid" },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "paid", status: "confirmed" },
    }),
    cart
      ? prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      : Promise.resolve(),
  ]);

  res.json({ message: "Payment verified successfully" });
});

export default router;
