import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// POST /api/reviews — submit or update a review
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { productId, rating, comment } = req.body as {
    productId?: string;
    rating?: number;
    comment?: string;
  };

  if (!productId || rating === undefined) {
    res.status(400).json({ message: "productId and rating are required" });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ message: "rating must be between 1 and 5" });
    return;
  }

  // Verify user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: req.userId, paymentStatus: "paid" },
    },
  });

  if (!hasPurchased) {
    res.status(403).json({ message: "You can only review products you have purchased" });
    return;
  }

  // Upsert review
  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: req.userId!, productId } },
    create: {
      userId: req.userId!,
      productId,
      rating,
      comment: comment?.trim() || null,
    },
    update: {
      rating,
      comment: comment?.trim() || null,
    },
    include: { user: { select: { name: true, avatar: true } } },
  });

  // Update product rating aggregate
  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      reviewCount: aggregate._count.id,
    },
  });

  res.status(201).json(review);
});

// DELETE /api/reviews/:productId — remove own review
router.delete("/:productId", authMiddleware, async (req: AuthRequest, res) => {
  const productId = String(req.params["productId"]);

  await prisma.review
    .delete({
      where: { userId_productId: { userId: req.userId!, productId } },
    })
    .catch(() => null);

  // Recalculate rating
  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      reviewCount: aggregate._count.id,
    },
  });

  res.json({ message: "Review removed" });
});

export default router;
