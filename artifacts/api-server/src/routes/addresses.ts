import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/addresses
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.userId },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  res.json(addresses);
});

// POST /api/addresses
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { name, phone, address, city, state, pincode, isDefault } =
    req.body as {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    };

  if (!name || !phone || !address || !city || !state || !pincode) {
    res.status(400).json({ message: "All address fields are required" });
    return;
  }

  if (isDefault) {
    // Unset other defaults
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const newAddress = await prisma.address.create({
    data: {
      userId: req.userId!,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault ?? false,
    },
  });

  res.status(201).json(newAddress);
});

// PUT /api/addresses/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);
  const { name, phone, address, city, state, pincode, isDefault } =
    req.body as {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    };

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    res.status(404).json({ message: "Address not found" });
    return;
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: { name, phone, address, city, state, pincode, isDefault },
  });

  res.json(updated);
});

// DELETE /api/addresses/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    res.status(404).json({ message: "Address not found" });
    return;
  }

  await prisma.address.delete({ where: { id } });
  res.json({ message: "Address deleted" });
});

export default router;
