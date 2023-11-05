import mongoose from "mongoose";

export const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    category_id: {
      type: String,
      required: true,
    },
    service_id: {
      type: String,
      required: true,
    },
    calendar_id: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    contact_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
