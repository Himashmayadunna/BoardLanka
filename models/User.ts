import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  marketingUpdates: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    accountType: {
      type: String,
      required: true,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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
    },
    password: {
      type: String,
      required: true,
    },
    marketingUpdates: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent model recompilation during hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
