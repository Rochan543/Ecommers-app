import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const googleClient = new OAuth2Client(process.env["GOOGLE_CLIENT_ID"]);

function signToken(userId: string): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

async function resolveGoogleUser(
  token: string,
  tokenType: "id_token" | "access_token",
): Promise<{ email: string; name: string; picture?: string; googleId: string }> {
  if (tokenType === "access_token") {
    // Verify access token by calling Google's userinfo endpoint server-side
    const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Invalid Google access token");
    const info = (await res.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };
    if (!info.email) throw new Error("Google userinfo missing email");
    return {
      email: info.email,
      name: info.name,
      picture: info.picture,
      googleId: info.id,
    };
  }

  // ID token flow (OIDC) — verify cryptographically
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env["GOOGLE_CLIENT_ID"],
  });

  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Invalid Google token payload");

  return {
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture,
    googleId: payload.sub,
  };
}

// POST /api/auth/google
router.post("/google", async (req, res) => {
  const { idToken, accessToken } = req.body as {
    idToken?: string;
    accessToken?: string;
  };

  if (!idToken && !accessToken) {
    res.status(400).json({ message: "idToken or accessToken is required" });
    return;
  }

  try {
    const { email, name, picture, googleId } = await resolveGoogleUser(
      accessToken ?? idToken!,
      accessToken ? "access_token" : "id_token",
    );

    // Create or find user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name ?? email.split("@")[0],
          avatar: picture ?? null,
          googleId,
        },
      });
      // Create empty cart for new user
      await prisma.cart.create({ data: { userId: user.id } });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: picture ?? user.avatar },
      });
    }

    const token = signToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log?.error({ err }, "Google auth failed");
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
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
<<<<<<< HEAD
    isAdmin: user.isAdmin,
=======
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
