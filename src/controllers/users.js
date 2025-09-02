import { PASSWORD_SALT } from "../constants/index.js";
import { compare, hash } from "bcryptjs";
import { signUserTokenSetCookies, clearUserTokens } from "../utils/tokens.js";
import { prisma } from "../lib/prisma.js";

// Utility to remove sensitive data from the user object
const removeSensitiveUserData = (user) => {
  if (!user) return null;
  const { password, accessToken, refreshToken, ...safeUser } = user;
  return safeUser;
};

// ===================================
// Sign Up Controller
// ===================================
export async function signUp(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "All fields are required.", success: false });
  }
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(409)
        .json({ error: `User email: ${email} already exists.` });
    }

    if (password.trim().length < 8) {
      return res.status(400).json({
        error: "A valid password must be at least 8 characters.",
        success: false,
      });
    }

    const hashedPassword = await hash(password, PASSWORD_SALT);
    const newUser = { name, email, password: hashedPassword };

    const user = await prisma.user.create({ data: newUser });
    if (!user) {
      return res.status(500).json({
        error: "An unexpected error occurred during user creation.",
        success: false,
      });
    }

    // Sign a new token and set cookies
    await signUserTokenSetCookies(res, {
      name: user.name,
      email: user.email,
      id: user.id,
    });

    return res.status(201).json({
      message: "User created and signed in successfully.",
      user: removeSensitiveUserData(user),
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

// ===================================
// Sign In Controller
// ===================================
export async function signIn(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "All fields are required.", success: false });
  }
  try {
    const foundUser = await prisma.user.findUnique({ where: { email } });
    if (!foundUser) {
      return res
        .status(404)
        .json({ error: `User email: ${email} does not exist.` });
    }

    const match = await compare(password, foundUser.password);
    if (!match) {
      return res.status(401).json({ error: `Invalid user password.` }); // Use 401 for incorrect credentials
    }

    const { accessToken, refreshToken } = await signUserTokenSetCookies(res, {
      name: foundUser.name,
      email: foundUser.email,
      id: foundUser.id,
    });

    const user = await prisma.user.update({
      where: { id: foundUser.id },
      data: { accessToken, refreshToken },
    });
    if (!user) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }

    return res.status(200).json({
      message: "User signed in successfully.",
      user: removeSensitiveUserData(user),
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

// ===================================
// Log Out Controller
// ===================================
export async function logout(req, res) {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res
        .status(400)
        .json({ error: "No user is currently logged in.", success: false });
    }

    // Clear user's accessToken in the database
    const user = await prisma.user.findFirst({ where: { accessToken } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { accessToken: null },
      });
    }

    // Clear cookies
    clearUserTokens(res);

    return res.status(200).json({
      message: "User logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

// ===================================
// Refresh Token Controller
// ===================================
export async function refreshToken(req, res) {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res
      .status(403)
      .json({ error: "Unauthorized: No refresh token found.", success: false });
  }

  try {
    const foundUser = await prisma.user.findFirst({ where: { refreshToken } });
    if (!foundUser) {
      clearUserTokens(res); // Clear any lingering invalid cookies
      return res
        .status(403)
        .json({ error: "Forbidden: Invalid refresh token.", success: false });
    }

    // Sign a new token set
    const { accessToken } = await signUserTokenSetCookies(res, {
      name: foundUser.name,
      email: foundUser.email,
      id: foundUser.id,
    });

    // Update the accessToken in the database
    const user = await prisma.user.update({
      where: { id: foundUser.id },
      data: { accessToken },
    });

    return res.status(200).json({
      message: "Token refreshed successfully.",
      user: removeSensitiveUserData(user),
      accessToken,
      success: true,
    });
  } catch (error) {
    console.error({ error });
    clearUserTokens(res); // Clear cookies on error
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

// ===================================
// Get Current User Controller (Protected Route)
// ===================================
export async function getCurrentUser(req, res) {
  const id = req.id; // `req.user` is set by a middleware that verifies the access token

  if (!id) {
    return res.status(401).json({
      error: "Unauthorized: No active session found.",
      success: false,
    });
  }

  // Fetch the latest user data from the database
  try {
    const foundUser = await prisma.user.findUnique({ where: { id } });
    if (!foundUser) {
      return res.status(404).json({ error: "User not found.", success: false });
    }

    return res.status(200).json({
      user: removeSensitiveUserData(foundUser),
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
