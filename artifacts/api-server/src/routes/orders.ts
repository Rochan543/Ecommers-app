import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

function formatAddress(a: {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}) {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    address: a.address,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: a.isDefault,
  };
}

function formatOrder(order: {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: Date;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  address: Parameters<typeof formatAddress>[0];
}) {
  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      image: i.image,
      quantity: i.quantity,
      price: i.price,
    })),
    address: formatAddress(order.address),
  };
}

// GET /api/orders
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "10"));
  const skip = (page - 1) * limit;

  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    skip,
    take: limit,
    include: { items: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders.map(formatOrder));
});

// POST /api/orders
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { addressId, couponCode } = req.body as {
    addressId?: string;
    couponCode?: string;
  };

  if (!addressId) {
    res.status(400).json({ message: "addressId is required" });
    return;
  }

  // Get user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId: req.userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    res.status(400).json({ message: "Cart is empty" });
    return;
  }

  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: req.userId },
  });

  if (!address) {
    res.status(400).json({ message: "Invalid address" });
    return;
  }

  // Calculate total
  const total = cart.items.reduce((sum, item) => {
    const price = item.product.discountedPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      addressId,
      total: Math.round(total * 100) / 100,
      couponCode,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.product.discountedPrice ?? item.product.price,
        })),
      },
    },
    include: { items: true, address: true },
  });

  res.status(201).json(formatOrder(order));
});

// GET /api/orders/:id
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);

  const order = await prisma.order.findFirst({
    where: { id, userId: req.userId },
    include: { items: true, address: true },
  });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

export default router;
