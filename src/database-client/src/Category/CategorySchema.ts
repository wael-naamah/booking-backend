import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    sorting_order: {
      type: String,
      required: false,
      enum: ['asc', 'desc'],
    },
    show_performance_in_summary: Boolean,
    show_service_in_email: Boolean,
    info_display_type: String,
    show_performance_on: String,
  },
  { _id: false }
);

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    abbreviation_id: {
      type: Number,
      required: true,
    }
  }
);

export const schema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
    },
    choices: {
      type: String,
      required: true,
    },
    selection_is_optional: {
      type: Boolean,
      required: true,
    },
    show_price: {
      type: Boolean,
      required: true,
    },
    show_appointment_duration: {
      type: Boolean,
      required: true,
    },
    no_columns_of_services: {
      type: Number,
      required: true,
    },
    full_screen: {
      type: Boolean,
      required: true,
    },
    folded: {
      type: Boolean,
      required: true,
    },
    online_booking: {
      type: Boolean,
      required: true,
    },
    remarks: String,
    unique_id: {
      type: Number,
      required: true,
    },
    display_status: {
      type: String,
      required: true,
      enum: ['show', 'hid'],
      default: 'show',
    },
    advanced_settings: {
      type: settingsSchema,
      required: true,
    },
    services: [{
      type: serviceSchema,
      required: false,
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
