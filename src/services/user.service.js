import User from "../models/user.model.js";
import NotFoundError from "../errors/not-found-error.error.js";

const createUser = async (userData) => {
  // Create the user
  const user = await User.create(userData);

  // Return user object without password
  const { password : _password, ...userWithoutPassword } = user.toObject();

  return userWithoutPassword;
};


export async function updatePassword(
  userId,
  password
) {
  return User.findByIdAndUpdate(
    userId,
    {
      password,
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

const getAllUsers = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt",
    order = "desc",
  } = query;

  let where = {};

  if (search) {
    where.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(where);
  const totalPages = Math.ceil(total / limit);

  const users = await User.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ [sort]: order });

  return {
    users,
    total,
    limit: +limit,
    totalPages,
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const { password  : _password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const updateUser = async (userId, userData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(userData.name && { name: userData.name }),
      ...(userData.email && { email: userData.email }),
      ...(userData.password && { password: userData.password }),
      ...(userData.role && { role: userData.role }), // ✅ ADD THIS
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const { password  : _password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return { message: "User deleted successfully" };
};

export { createUser, getAllUsers, getUserById, updateUser, deleteUser };
