import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminMiddleware, type AdminRequest } from "../middlewares/adminAuth.js";

const router = Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

router.get("/stats", async (_req, res) => {
  const [users, orders, products, categories, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.aggregate({
      where: { paymentStatus: "paid" },
      _sum: { total: true },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const lowStock = await prisma.inventory.findMany({
    where: { quantity: { lt: 10 } },
    include: { product: { select: { name: true, image: true } } },
    take: 10,
  });

  res.json({
    totalUsers: users,
    totalOrders: orders,
    totalProducts: products,
    totalCategories: categories,
    totalRevenue: revenue._sum.total ?? 0,
    recentOrders,
    lowStock,
  });
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

router.get("/analytics", async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [dailySales, monthlySales, yearlySales, topProducts] = await Promise.all([
    // Last 7 days
    prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        paymentStatus: "paid",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _sum: { total: true },
    }),
    // This month
    prisma.order.aggregate({
      where: { paymentStatus: "paid", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: { id: true },
    }),
    // This year
    prisma.order.aggregate({
      where: { paymentStatus: "paid", createdAt: { gte: startOfYear } },
      _sum: { total: true },
      _count: { id: true },
    }),
    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  res.json({ dailySales, monthlySales, yearlySales, topProducts });
});

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

router.get("/products", async (req, res) => {
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "20"));
  const search = String(req.query["search"] ?? "");

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : {},
      include: { category: { select: { name: true } }, inventory: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where: search ? { name: { contains: search, mode: "insensitive" } } : {} }),
  ]);

  res.json({ products, total, page, limit });
});

router.post("/products", async (req, res) => {
  const data = req.body as {
    name: string; description?: string; price: number; discountedPrice?: number;
    unit: string; image: string; categoryId: string; inStock?: boolean;
    isFeatured?: boolean; deliveryTime?: number; discountPercent?: number;
    images?: string[];
  };

  const product = await prisma.product.create({
    data: {
      name: data.name, description: data.description, price: data.price,
      discountedPrice: data.discountedPrice, unit: data.unit, image: data.image,
      categoryId: data.categoryId, inStock: data.inStock ?? true,
      isFeatured: data.isFeatured ?? false,
      deliveryTime: data.deliveryTime ?? 30,
      discountPercent: data.discountPercent,
      ...(data.images?.length ? {
        images: { create: data.images.map((url, pos) => ({ imageUrl: url, position: pos })) },
      } : {}),
    },
    include: { category: true, images: true },
  });

  res.status(201).json(product);
});

router.put("/products/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const data = req.body as Partial<{
    name: string; description: string; price: number; discountedPrice: number;
    unit: string; image: string; categoryId: string; inStock: boolean;
    isFeatured: boolean; deliveryTime: number; discountPercent: number;
  }>;

  const product = await prisma.product.update({ where: { id }, data, include: { category: true } });
  res.json(product);
});

router.delete("/products/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.product.delete({ where: { id } });
  res.json({ message: "Product deleted" });
});

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

router.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  res.json(categories);
});

router.post("/categories", async (req, res) => {
  const { name, slug, image, description, isActive, sortOrder } = req.body as {
    name: string; slug: string; image: string; description?: string; isActive?: boolean; sortOrder?: number;
  };
  const category = await prisma.category.create({
    data: { name, slug, image, description, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
  });
  res.status(201).json(category);
});

router.put("/categories/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const data = req.body as Partial<{
    name: string; slug: string; image: string; description: string; isActive: boolean; sortOrder: number;
  }>;
  const category = await prisma.category.update({ where: { id }, data });
  res.json(category);
});

router.delete("/categories/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.category.delete({ where: { id } });
  res.json({ message: "Category deleted" });
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────

router.get("/orders", async (req, res) => {
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "20"));
  const status = req.query["status"] as string | undefined;

  const where = status ? { status: status as any } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, total, page, limit });
});

router.put("/orders/:id/status", async (req, res) => {
  const id = String(req.params["id"]);
  const { status } = req.body as { status: string };

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as any },
  });
  res.json(order);
});

// ─── USERS ───────────────────────────────────────────────────────────────────

router.get("/users", async (req, res) => {
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "20"));
  const search = String(req.query["search"] ?? "");

  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page, limit });
});

router.put("/users/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const { isAdmin } = req.body as { isAdmin?: boolean };
  const user = await prisma.user.update({ where: { id }, data: { isAdmin } });
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
});

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

router.get("/reviews", async (req, res) => {
  const page = parseInt(String(req.query["page"] ?? "1"));
  const limit = parseInt(String(req.query["limit"] ?? "20"));

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { name: true, avatar: true } },
        product: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count(),
  ]);

  res.json({ reviews, total, page, limit });
});

router.delete("/reviews/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.review.delete({ where: { id } });
  res.json({ message: "Review deleted" });
});

// ─── BANNERS ─────────────────────────────────────────────────────────────────

router.get("/banners", async (_req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });
  res.json(banners);
});

router.post("/banners", async (req, res) => {
  const { title, image, link, isActive, position } = req.body as {
    title: string; image: string; link?: string; isActive?: boolean; position?: number;
  };
  const banner = await prisma.banner.create({ data: { title, image, link, isActive: isActive ?? true, position: position ?? 0 } });
  res.status(201).json(banner);
});

router.put("/banners/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const data = req.body as Partial<{ title: string; image: string; link: string; isActive: boolean; position: number }>;
  const banner = await prisma.banner.update({ where: { id }, data });
  res.json(banner);
});

router.delete("/banners/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.banner.delete({ where: { id } });
  res.json({ message: "Banner deleted" });
});

// ─── OFFERS ──────────────────────────────────────────────────────────────────

router.get("/offers", async (_req, res) => {
  const offers = await prisma.offer.findMany({ orderBy: { isActive: "desc" } });
  res.json(offers);
});

router.post("/offers", async (req, res) => {
  const { title, description, discount, code, isActive, expiresAt } = req.body as {
    title: string; description: string; discount: string; code?: string; isActive?: boolean; expiresAt?: string;
  };
  const offer = await prisma.offer.create({
    data: { title, description, discount, code, isActive: isActive ?? true, expiresAt: expiresAt ? new Date(expiresAt) : null },
  });
  res.status(201).json(offer);
});

router.put("/offers/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const data = req.body as Partial<{ title: string; description: string; discount: string; code: string; isActive: boolean; expiresAt: string }>;
  const offer = await prisma.offer.update({
    where: { id },
    data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined },
  });
  res.json(offer);
});

router.delete("/offers/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.offer.delete({ where: { id } });
  res.json({ message: "Offer deleted" });
});

// ─── COUPONS ─────────────────────────────────────────────────────────────────

router.get("/coupons", async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json(coupons);
});

router.post("/coupons", async (req, res) => {
  const { code, title, description, type, discount, minOrderAmount, maxDiscount, usageLimit, isActive, expiresAt } = req.body as {
    code: string; title: string; description?: string; type: "percentage" | "flat";
    discount: number; minOrderAmount?: number; maxDiscount?: number; usageLimit?: number;
    isActive?: boolean; expiresAt?: string;
  };
  const coupon = await prisma.coupon.create({
    data: {
      code: code.trim().toUpperCase(),
      title, description, type, discount,
      minOrderAmount: minOrderAmount ?? 0,
      maxDiscount: maxDiscount ?? null,
      usageLimit: usageLimit ?? null,
      isActive: isActive ?? true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
  res.status(201).json(coupon);
});

router.put("/coupons/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const data = req.body as Partial<{
    code: string; title: string; description: string; type: string;
    discount: number; minOrderAmount: number; maxDiscount: number;
    usageLimit: number; isActive: boolean; expiresAt: string;
  }>;
  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    } as any,
  });
  res.json(coupon);
});

router.delete("/coupons/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.coupon.delete({ where: { id } });
  res.json({ message: "Coupon deleted" });
});

// ─── INVENTORY ───────────────────────────────────────────────────────────────

router.get("/inventory", async (_req, res) => {
  const inventory = await prisma.inventory.findMany({
    include: { product: { select: { name: true, image: true } } },
    orderBy: { quantity: "asc" },
  });
  res.json(inventory);
});

router.put("/inventory/:productId", async (req, res) => {
  const productId = String(req.params["productId"]);
  const { quantity } = req.body as { quantity: number };

  const inv = await prisma.inventory.upsert({
    where: { productId },
    create: { productId, quantity },
    update: { quantity },
  });

  // Sync inStock flag
  await prisma.product.update({ where: { id: productId }, data: { inStock: quantity > 0 } });

  res.json(inv);
});

// ─── DELIVERY SLOTS ──────────────────────────────────────────────────────────

router.get("/delivery-slots", async (_req, res) => {
  const slots = await prisma.deliverySlot.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(slots);
});

router.post("/delivery-slots", async (req, res) => {
  const { label, startTime, endTime, isActive, maxOrders, sortOrder } = req.body as {
    label: string; startTime: string; endTime: string; isActive?: boolean; maxOrders?: number; sortOrder?: number;
  };
  const slot = await prisma.deliverySlot.create({
    data: { label, startTime, endTime, isActive: isActive ?? true, maxOrders: maxOrders ?? 50, sortOrder: sortOrder ?? 0 },
  });
  res.status(201).json(slot);
});

router.put("/delivery-slots/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const data = req.body as Partial<{ label: string; startTime: string; endTime: string; isActive: boolean; maxOrders: number; sortOrder: number }>;
  const slot = await prisma.deliverySlot.update({ where: { id }, data });
  res.json(slot);
});

router.delete("/delivery-slots/:id", async (req, res) => {
  const id = String(req.params["id"]);
  await prisma.deliverySlot.delete({ where: { id } });
  res.json({ message: "Delivery slot deleted" });
});

// ─── SUPPORT TICKETS ─────────────────────────────────────────────────────────

router.get("/support-tickets", async (req, res) => {
  const status = req.query["status"] as string | undefined;
  const tickets = await prisma.supportTicket.findMany({
    where: status ? { status: status as any } : {},
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(tickets);
});

router.put("/support-tickets/:id", async (req, res) => {
  const id = String(req.params["id"]);
  const { reply, status } = req.body as { reply?: string; status?: string };
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      reply: reply ?? undefined,
      status: status as any ?? undefined,
    },
  });
  res.json(ticket);
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

router.get("/notifications", async (_req, res) => {
  const notifications = await prisma.notification.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
});

router.post("/notifications", async (req, res) => {
  const { title, body, type, userIds } = req.body as {
    title: string; body: string; type?: string; userIds?: string[];
  };

  let targetUserIds: string[];
  if (userIds && userIds.length > 0) {
    targetUserIds = userIds;
  } else {
    // Send to all users
    const users = await prisma.user.findMany({ select: { id: true } });
    targetUserIds = users.map((u) => u.id);
  }

  await prisma.notification.createMany({
    data: targetUserIds.map((userId) => ({
      userId,
      title,
      body,
      type: type ?? "general",
    })),
  });

  res.status(201).json({ message: `Notification sent to ${targetUserIds.length} users` });
});

export default router;
