import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/users/profile
router.get("/profile", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
  });
});

// PUT /api/users/profile
router.put("/profile", authMiddleware, async (req: AuthRequest, res) => {
  const { name, phone } = req.body as { name?: string; phone?: string };

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
    },
  });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
