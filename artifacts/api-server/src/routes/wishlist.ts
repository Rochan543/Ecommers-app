import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

function formatProduct(p: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  unit: string;
  image: string;
  categoryId: string;
  category: { name: string };
  inStock: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  discountPercent: number | null;
}) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    discountedPrice: p.discountedPrice,
    unit: p.unit,
    image: p.image,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    rating: p.rating,
    reviewCount: p.reviewCount,
    deliveryTime: p.deliveryTime,
    discountPercent: p.discountPercent,
  };
}

// GET /api/wishlist
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.userId },
    include: { product: { include: { category: true } } },
    orderBy: { id: "desc" },
  });

  res.json(
    wishlist.map((w) => ({
      id: w.id,
      productId: w.productId,
      product: formatProduct(w.product),
    })),
  );
});

// POST /api/wishlist
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { productId } = req.body as { productId?: string };

  if (!productId) {
    res.status(400).json({ message: "productId is required" });
    return;
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });

  if (existing) {
    const item = await prisma.wishlist.findUnique({
      where: { id: existing.id },
      include: { product: { include: { category: true } } },
    });
    res.json({
      id: item!.id,
      productId: item!.productId,
      product: formatProduct(item!.product),
    });
    return;
  }

  const item = await prisma.wishlist.create({
    data: { userId: req.userId!, productId },
    include: { product: { include: { category: true } } },
  });

  res.json({
    id: item.id,
    productId: item.productId,
    product: formatProduct(item.product),
  });
});

// DELETE /api/wishlist/:productId
router.delete("/:productId", authMiddleware, async (req: AuthRequest, res) => {
  const productId = String(req.params["productId"]);

  await prisma.wishlist
    .delete({
      where: {
        userId_productId: { userId: req.userId!, productId },
      },
    })
    .catch(() => null);

  res.json({ message: "Removed from wishlist" });
});

export default router;
