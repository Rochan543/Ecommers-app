import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/offers
router.get("/", async (_req, res) => {
  const now = new Date();
  const offers = await prisma.offer.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });

  res.json(
    offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      discount: o.discount,
      code: o.code,
    })),
  );
});

export default router;
