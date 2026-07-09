import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const cartInclude = {
  items: {
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: { id: "asc" as const },
  },
};

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

function formatCart(cart: {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: Parameters<typeof formatProduct>[0];
  }>;
}) {
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: formatProduct(item.product),
  }));

  const total = items.reduce((sum, item) => {
    const price = item.product.discountedPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return {
    id: cart.id,
    items,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  return cart;
}

// GET /api/cart
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const cart = await getOrCreateCart(req.userId!);
  res.json(formatCart(cart));
});

// DELETE /api/cart
router.delete("/", authMiddleware, async (req: AuthRequest, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  res.json({ message: "Cart cleared" });
});

// POST /api/cart/items
router.post("/items", authMiddleware, async (req: AuthRequest, res) => {
  const { productId, quantity = 1 } = req.body as {
    productId?: string;
    quantity?: number;
  };

  if (!productId) {
    res.status(400).json({ message: "productId is required" });
    return;
  }

  const cart = await getOrCreateCart(req.userId!);

  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updated = await getOrCreateCart(req.userId!);
  res.json(formatCart(updated));
});

// PUT /api/cart/items/:id
router.put("/items/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);
  const { quantity } = req.body as { quantity?: number };

  if (quantity === undefined || quantity < 0) {
    res.status(400).json({ message: "quantity must be >= 0" });
    return;
  }

  // Verify ownership: item must belong to the authenticated user's cart
  const userCart = await prisma.cart.findUnique({ where: { userId: req.userId } });
  if (!userCart) {
    res.status(404).json({ message: "Cart not found" });
    return;
  }
  const item = await prisma.cartItem.findFirst({ where: { id, cartId: userCart.id } });
  if (!item) {
    res.status(404).json({ message: "Cart item not found" });
    return;
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id } });
  } else {
    await prisma.cartItem.update({ where: { id }, data: { quantity } });
  }

  const cart = await getOrCreateCart(req.userId!);
  res.json(formatCart(cart));
});

// DELETE /api/cart/items/:id
router.delete("/items/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);

  // Verify ownership: item must belong to the authenticated user's cart
  const userCart = await prisma.cart.findUnique({ where: { userId: req.userId } });
  if (!userCart) {
    res.status(404).json({ message: "Cart not found" });
    return;
  }
  const item = await prisma.cartItem.findFirst({ where: { id, cartId: userCart.id } });
  if (!item) {
    res.status(404).json({ message: "Cart item not found" });
    return;
  }

  await prisma.cartItem.delete({ where: { id } });
  const cart = await getOrCreateCart(req.userId!);
  res.json(formatCart(cart));
});

export default router;
