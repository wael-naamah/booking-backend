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
    phone_numbber_2: String,
    phone_numbber_3: String,
    email: {
      type: String,
      required: true,
    }, // unique: true, TODO: need to discuss the requirements
    note_on_address: String,
    brand_of_device: String,
    model: String,
    exhaust_gas_measurement: Boolean,
    has_maintenance_agreement: Boolean,
    has_bgas_before: Boolean,
    year: String,
    invoice_number: Number,
    newsletter: Boolean,
  
    remarks: String,
    attachments: [attachmentSchema],
    categories_permission: [{type: String, required: false}]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
