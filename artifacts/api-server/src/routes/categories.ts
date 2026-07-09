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

// GET /api/categories
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: { where: { inStock: true } } } },
    },
  });

  res.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      description: c.description,
      productCount: c._count.products,
    })),
  );
});

// GET /api/categories/:id/products
router.get("/:id/products", async (req, res) => {
  const { id } = req.params;
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "20"));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: id, inStock: true },
      skip,
      take: limit,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { categoryId: id, inStock: true } }),
  ]);

  res.json({
    products: products.map(formatProduct),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

export default router;
