import { PASSWORD_SALT } from "../constants/index.js";
import { readData, writeData } from "../utils/index.js";
import { compare, hash } from "bcryptjs";
import { signUserTokenSetCookies } from "../utils/tokens.js";

export async function signUp(req, res) {
  const { name, email, password } = await req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "All fields are required.", success: false });
  }
  try {
    // check if user record exists
    const users = await readData("users");

    if (!users) {
      return res.status(500).json({ error: "Users not found", success: false });
    }

    const userExists = users.find((item) => item.email === email);

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

    const result = writeData([...users, newUser], "users");
    if (!result) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }

    return res.status(201).json({
      message: "User created successfully.",
      user: { ...newUser, password: undefined, accessToken: undefined },
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
    // check if user record exists
    const users = await readData("users");

    if (!users) {
      return res.status(500).json({ error: "Users not found", success: false });
    }

    const foundUser = users.find((item) => item.email === email);

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
    const remainingUsers = users.filter((user) => user.email !== email);

    const updatedUser = { ...foundUser, accessToken };
    const result = writeData([...remainingUsers, updatedUser], "users");
    if (!result) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }

    return res.status(200).json({
      message: "User signed in successfully.",
      user: { ...foundUser, password: undefined, accessToken: undefined },
      success: true,
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
