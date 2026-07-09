import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/banners
router.get("/", async (_req, res) => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });

  res.json(
    banners.map((b) => ({
      id: b.id,
      title: b.title,
      image: b.image,
      link: b.link,
      position: b.position,
    })),
  );
});

export default router;
