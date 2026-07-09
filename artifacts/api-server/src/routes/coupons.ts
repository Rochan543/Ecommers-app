import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// POST /api/coupons/validate — validate a coupon for the current cart
router.post("/validate", authMiddleware, async (req: AuthRequest, res) => {
  const { code, orderTotal } = req.body as { code?: string; orderTotal?: number };

  if (!code || orderTotal === undefined) {
    res.status(400).json({ message: "code and orderTotal are required" });
    return;
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    res.status(400).json({ message: "Invalid or inactive coupon code" });
    return;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400).json({ message: "Coupon has expired" });
    return;
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    res.status(400).json({ message: "Coupon usage limit reached" });
    return;
  }

  if (orderTotal < coupon.minOrderAmount) {
    res.status(400).json({
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
    });
    return;
  }

  let discountAmount: number;
  if (coupon.type === "percentage") {
    discountAmount = (orderTotal * coupon.discount) / 100;
    if (coupon.maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discount;
  }
  discountAmount = Math.min(discountAmount, orderTotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  res.json({
    valid: true,
    code: coupon.code,
    title: coupon.title,
    type: coupon.type,
    discount: coupon.discount,
    discountAmount,
    finalTotal: Math.max(0, orderTotal - discountAmount),
  });
});

export default router;
