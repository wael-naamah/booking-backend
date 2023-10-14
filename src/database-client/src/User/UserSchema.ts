import mongoose, { Schema } from "mongoose";
import { UserRole } from "../Schema";

const internalSchema = new Schema(
  {
    blacklisted: Boolean,
    verified: Boolean,
    verification: Object,
  },
  { _id: false }
);

export const schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: String,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      enum: UserRole,
      default: UserRole.User,
    },
    internal: {
      type: internalSchema,
      required: false,
    },
    remarks: String,
    img_url: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
