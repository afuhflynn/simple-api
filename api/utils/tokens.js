import jwt from "jsonwebtoken";
const { sign } = jwt;

const accessTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function signUserTokenSetCookies(res, payload) {
  const accessToken = await sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });

  const refreshToken = await sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });

  // set cookies
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
  res.cookie("accessToken", accessToken, accessTokenOptions);

  return { accessToken, refreshToken };
}

export const clearUserTokens = (res) => {
  res.clearCookie("accessToken", accessTokenOptions);
  res.clearCookie("refreshToken", refreshTokenOptions);
};
