import mongoose, { Schema } from "mongoose";
import { ScheduleType } from "../Schema";

export const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    calendar_id: {type: Schema.Types.ObjectId, ref: 'Calendars', required: false},
    working_hours_type: {
      type: String,
      enum: ScheduleType,
      default: ScheduleType.Weekly,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    time_from: {
      type: String,
      required: true,
    },
    time_to: {
      type: String,
      required: true,
    },
    reason: String,
    deactivate_working_hours: Boolean,
    one_time_appointment_link: String,
    only_internally: Boolean,
    restricted_to_services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categories.services' }],
    possible_appointment: Number,
    active: Boolean,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
