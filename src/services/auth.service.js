import { createUser } from "./user.service.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import NotFoundError from "../errors/not-found-error.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";
import { compare } from "bcrypt";



export const register = async (userData) => {
  const user = await createUser(userData);

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3h" }
  );

  return { user, token };
};




export const login = async (userData) => {

  const user = await User.findOne({ email: userData.email });

  if (!user) {
    throw new NotFoundError("This email is not registered.");
  }

  const isPasswordValid = await compare(
    userData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3h" }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const { password, ...userWithoutPassword } = user.toObject();

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};


