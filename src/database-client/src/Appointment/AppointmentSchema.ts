import mongoose, { Schema } from "mongoose";

export const attachmentSchema = new Schema(
  {
    title: String,
    url: String,
  },
  { _id: false }
);

export const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    service_abbreviation_id: {
      type: Number,
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
    assign_to: String,
    salutation: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    zip_code: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    brand_of_device: String,
    model: String,
    exhaust_gas_measurement: Boolean,
    has_maintenance_agreement: Boolean,
    has_bgas_before: Boolean,
    year: String,
    remarks: String,
    attachment: attachmentSchema,
    remember_entries: Boolean,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
