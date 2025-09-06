import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
const { verify } = jwt;

export async function verifyToken(req, res, next) {
  const { accessToken } = req.cookies;

  if (!accessToken)
    return res
      .status(401)
      .json({ success: false, error: "Please login into your account" });

  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  try {
    // Verify the access token
    const decoded = verify(accessToken, ACCESS_TOKEN_SECRET);

    const foundUser = await prisma.user.findFirst({
      where: { accessToken, id: decoded.id },
    });

    if (!foundUser)
      return res
        .status(401)
        .json({ success: false, error: "Please login into your account" });

    req.id = foundUser.id;
    req.name = foundUser.name;
    req.email = foundUser.email;
    next();
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
