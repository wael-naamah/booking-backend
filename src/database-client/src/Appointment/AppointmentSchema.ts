import mongoose, { Schema } from "mongoose";
import { AppointmentStatus } from "../Schema";

export const attachmentSchema = new Schema(
  {
    title: String,
    url: String,
  },
  { _id: false }
);

export const controlPointsSchema = new Schema(
  {
    title: String,
    value: Number,
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
    appointment_status: {
      type: String,
      required: true,
      default: AppointmentStatus.Confirmed,
    },
    brand_of_device: String,
    model: String,
    exhaust_gas_measurement: Boolean,
    has_maintenance_agreement: Boolean,
    has_bgas_before: Boolean,
    year: String,
    invoice_number: Number,
    contract_number: Number,
    imported_service_name: String,
    imported_service_duration: String,
    imported_service_price: String,
    attachments: [attachmentSchema],
    remarks: String,
    employee_attachments: [attachmentSchema],
    employee_remarks: String,
    company_remarks: String,
    control_points: [controlPointsSchema],
    created_by: String,
    ended_at: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
