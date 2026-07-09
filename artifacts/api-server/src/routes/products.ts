import { Router } from "express";
import { prisma } from "../lib/prisma.js";

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

// GET /api/products
router.get("/", async (req, res) => {
  const search = String(req.query["search"] ?? "");
  const categoryId = req.query["categoryId"] as string | undefined;
  const featured = req.query["featured"] === "true";
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "20"));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where["name"] = { contains: search, mode: "insensitive" };
  }
  if (categoryId) {
    where["categoryId"] = categoryId;
  }
  if (featured) {
    where["isFeatured"] = true;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { category: true },
      orderBy: featured
        ? [{ isFeatured: "desc" }, { rating: "desc" }]
        : [{ createdAt: "desc" }],
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products: products.map(formatProduct),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: id },
      inStock: true,
    },
    take: 8,
    include: { category: true },
  });

  res.json({
    ...formatProduct(product),
    images: product.images.map((i) => i.imageUrl),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      userName: r.user.name,
      userAvatar: r.user.avatar,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
    relatedProducts: relatedProducts.map(formatProduct),
  });
});

export default router;
