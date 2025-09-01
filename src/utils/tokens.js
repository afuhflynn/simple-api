import jwt from "jsonwebtoken";
const { sign } = jwt;

export async function signUserTokenSetCookies(res, payload) {
  const accessToken = await sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "20d",
  });

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.APP_STATUS === "production",
    sameSite: "strict",
    maxAge: Date.now() + 20 * 60 * 60 * 1000, // 20 days
  });
  return { accessToken };
}
