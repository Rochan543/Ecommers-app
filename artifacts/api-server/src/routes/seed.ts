import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// POST /api/seed - seed initial data (dev only)
router.post("/", async (_req, res) => {
  if (process.env["NODE_ENV"] === "production") {
    res.status(403).json({ message: "Seed not available in production" });
    return;
  }

  // Check if already seeded
  const existing = await prisma.category.count();
  if (existing > 0) {
    res.json({ message: "Already seeded" });
    return;
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Flowers",
        slug: "flowers",
        image: "https://images.unsplash.com/photo-1487530811015-780f5d74b80b?w=400",
        description: "Fresh single flower stems and bouquets",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Garlands",
        slug: "garlands",
        image: "https://images.unsplash.com/photo-1610461888750-10bfc601b4a6?w=400",
        description: "Traditional Indian flower garlands",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Pooja Items",
        slug: "pooja-items",
        image: "https://images.unsplash.com/photo-1605025016887-1e9a8e0ac94a?w=400",
        description: "All essentials for your daily puja",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Bouquets",
        slug: "bouquets",
        image: "https://images.unsplash.com/photo-1490750967868-88df5691cc1a?w=400",
        description: "Beautiful bouquets for all occasions",
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Leaves & Greens",
        slug: "leaves-greens",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        description: "Mango leaves, banana leaves, betel leaves",
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: "Decor",
        slug: "decor",
        image: "https://images.unsplash.com/photo-1510832842230-87253f48d74b?w=400",
        description: "Flower decoration items for events",
        sortOrder: 6,
      },
    }),
  ]);

  const [flowers, garlands, pooja, bouquets] = categories;

  // Create products
  await prisma.product.createMany({
    data: [
      // Flowers
      { name: "Marigold (Genda) - 100g", price: 35, discountedPrice: 29, unit: "100g", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400", categoryId: flowers.id, inStock: true, isFeatured: true, rating: 4.5, reviewCount: 128, deliveryTime: 30, discountPercent: 17 },
      { name: "Rose - Red (10 stems)", price: 120, discountedPrice: 99, unit: "10 pcs", image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400", categoryId: flowers.id, inStock: true, isFeatured: true, rating: 4.7, reviewCount: 245, deliveryTime: 30, discountPercent: 18 },
      { name: "Jasmine (Mogra) - 50g", price: 45, discountedPrice: 39, unit: "50g", image: "https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?w=400", categoryId: flowers.id, inStock: true, isFeatured: false, rating: 4.6, reviewCount: 89, deliveryTime: 30 },
      { name: "Lotus (Kamala) - 5 pcs", price: 80, discountedPrice: null, unit: "5 pcs", image: "https://images.unsplash.com/photo-1560717845-968823efbee1?w=400", categoryId: flowers.id, inStock: true, isFeatured: true, rating: 4.8, reviewCount: 67, deliveryTime: 30 },
      { name: "Chrysanthemum - 100g", price: 30, discountedPrice: 25, unit: "100g", image: "https://images.unsplash.com/photo-1587334275934-fc8d1c3d3e7c?w=400", categoryId: flowers.id, inStock: true, isFeatured: false, rating: 4.3, reviewCount: 44, deliveryTime: 30 },
      // Garlands
      { name: "Jasmine Garland (Mogra Mala) - 1m", price: 65, discountedPrice: 55, unit: "1 meter", image: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400", categoryId: garlands.id, inStock: true, isFeatured: true, rating: 4.8, reviewCount: 312, deliveryTime: 25, discountPercent: 15 },
      { name: "Marigold Garland - 1m", price: 40, discountedPrice: 35, unit: "1 meter", image: "https://images.unsplash.com/photo-1603009944888-e0cb8d0e3e3b?w=400", categoryId: garlands.id, inStock: true, isFeatured: true, rating: 4.6, reviewCount: 189, deliveryTime: 25 },
      { name: "Rose Garland - 50cm", price: 90, discountedPrice: 79, unit: "50cm", image: "https://images.unsplash.com/photo-1548533850-3db5b1bc7b43?w=400", categoryId: garlands.id, inStock: true, isFeatured: false, rating: 4.5, reviewCount: 76, deliveryTime: 25 },
      { name: "Mixed Flower Garland - 1m", price: 75, discountedPrice: 65, unit: "1 meter", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400", categoryId: garlands.id, inStock: true, isFeatured: true, rating: 4.7, reviewCount: 134, deliveryTime: 25 },
      // Pooja Items
      { name: "Incense Sticks (Agarbatti) - Pack of 100", price: 45, discountedPrice: 39, unit: "100 pcs", image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400", categoryId: pooja.id, inStock: true, isFeatured: true, rating: 4.5, reviewCount: 567, deliveryTime: 20, discountPercent: 13 },
      { name: "Camphor (Kapoor) - 50g", price: 35, discountedPrice: null, unit: "50g", image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400", categoryId: pooja.id, inStock: true, isFeatured: false, rating: 4.6, reviewCount: 123, deliveryTime: 20 },
      { name: "Coconut - Pooja Grade", price: 25, discountedPrice: 22, unit: "1 pc", image: "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=400", categoryId: pooja.id, inStock: true, isFeatured: false, rating: 4.4, reviewCount: 89, deliveryTime: 20 },
      { name: "Kumkum + Turmeric Set", price: 55, discountedPrice: 45, unit: "set", image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400", categoryId: pooja.id, inStock: true, isFeatured: false, rating: 4.7, reviewCount: 234, deliveryTime: 20 },
      // Bouquets
      { name: "Mixed Flower Bouquet - Small", price: 199, discountedPrice: 169, unit: "1 pc", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc1a?w=400", categoryId: bouquets.id, inStock: true, isFeatured: true, rating: 4.9, reviewCount: 445, deliveryTime: 35, discountPercent: 15 },
      { name: "Rose Bouquet - 12 stems", price: 299, discountedPrice: 249, unit: "1 pc", image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400", categoryId: bouquets.id, inStock: true, isFeatured: true, rating: 4.8, reviewCount: 378, deliveryTime: 35 },
    ],
  });

  // Create banners
  await prisma.banner.createMany({
    data: [
      { title: "Fresh Flowers Daily", image: "https://images.unsplash.com/photo-1487530811015-780f5d74b80b?w=800", link: null, isActive: true, position: 1 },
      { title: "Wedding Decorations", image: "https://images.unsplash.com/photo-1510832842230-87253f48d74b?w=800", link: null, isActive: true, position: 2 },
      { title: "Pooja Essentials", image: "https://images.unsplash.com/photo-1605025016887-1e9a8e0ac94a?w=800", link: null, isActive: true, position: 3 },
    ],
  });

  // Create offers
  await prisma.offer.createMany({
    data: [
      { title: "First Order Offer", description: "Get ₹50 OFF on your first order above ₹249", discount: "₹50 OFF", code: "FIRST50", isActive: true },
      { title: "Free Delivery", description: "Free delivery on all orders above ₹199", discount: "FREE delivery", code: null, isActive: true },
      { title: "Wedding Special", description: "Flat 20% OFF on bulk garland orders", discount: "20% OFF", code: "WEDDING20", isActive: true },
    ],
  });

  res.json({ message: "Seeded successfully" });
});

export default router;
