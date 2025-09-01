import jwt from "jsonwebtoken";
import { readData } from "../utils/index.js";
const { verify } = jwt;

export async function verifyToken(req, res, next) {
  const authHeaders = await req.headers.authorization;
  const sentCookie = authHeaders.replace("Bearer ", "");
  try {
    // check if user record exists
    const users = await readData("users");

    if (!users) {
      return res.status(500).json({ error: "Users not found", success: false });
    }

    const foundUser = users.find((item) => item?.accessToken === sentCookie);

    if (!sentCookie || !foundUser)
      return res
        .status(401)
        .json({ success: false, error: "Please login into your account" });

    await verify(
      sentCookie,
      process.env.ACCESS_TOKEN_SECRET,
      {
        algorithms: ["HS256"],
      },
      async (error, data) => {
        if (error) {
          console.error({ error });
          return res.status(401).json({
            success: false,
            error: "Please login into your account",
          });
        }

        req.id = data.id;
        req.name = data.name;
        req.email = data.email;
        next();
      }
    );
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
