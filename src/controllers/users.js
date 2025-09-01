import { PASSWORD_SALT } from "../constants/index.js";
import { compare, hash } from "bcryptjs";
import { signUserTokenSetCookies } from "../utils/tokens.js";
import { prisma } from "../lib/prisma.js";

export async function signUp(req, res) {
  const { name, email, password } = await req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "All fields are required.", success: false });
  }
  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      return res
        .status(409)
        .json({ error: `User email: ${email} already exists.` });
    }

    // validate password length
    if (password && password.trim().length < 8) {
      return res.status(400).json({
        error: "A validate password must e atleast 8 characters.",
        success: false,
      });
    }

    // validate email
    if (email && !email.trim().includes("@")) {
      return res.status(400).json({
        error: "A validate email must include an '@' symbol.",
        success: false,
      });
    }

    // Hash user password
    const hashedPassword = await hash(password, PASSWORD_SALT);

    const newUser = {
      name,
      email,
      password: hashedPassword,
    };

    const user = await prisma.user.create({
      data: {
        ...newUser,
      },
    });
    if (!user) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }

    return res.status(201).json({
      message: "User created successfully.",
      user: { ...user, password: undefined, accessToken: undefined },
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function signIn(req, res) {
  const { email, password } = await req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "All fields are required.", success: false });
  }
  try {
    const foundUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!foundUser) {
      return res
        .status(404)
        .json({ error: `User email: ${email} does not exist.` });
    }

    // Compare user password
    const match = await compare(password, foundUser.password);

    if (!match) {
      return res.status(404).json({ error: `Invalid user password.` });
    }

    // sign user accessToken
    const { accessToken } = await signUserTokenSetCookies(res, {
      name: foundUser.name,
      email: foundUser.email,
      id: foundUser.id,
    });

    if (!accessToken) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }

    const user = await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        accessToken,
      },
    });
    if (!user) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }

    return res.status(200).json({
      message: "User signed in successfully.",
      user: { ...user, password: undefined, accessToken: undefined },
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
