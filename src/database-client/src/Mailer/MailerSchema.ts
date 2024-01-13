import mongoose from "mongoose";

export const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    sender: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    ssl_enabled: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
