// models/user.js
import { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: "Invalid email address",
      },
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

//
// 🔐 Hash password before save
//
UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }
});

//
// 🔐 Hash password before update
//
UserSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  if (update.password) {
    update.password = await hash(update.password, 10);
  }
});

const User = model("User", UserSchema);
export default User;
