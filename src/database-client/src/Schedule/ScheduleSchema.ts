import mongoose from "mongoose";
import { ScheduleType, WeekDay } from "../Schema";

export const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    calendar_id: {type: String, required: true},
    working_hours_type: {
      type: String,
      enum: ScheduleType,
      default: ScheduleType.Weekly,
      required: true,
    },
    weekday: {
      type: String,
      enum: WeekDay,
    },
    date_from: Date,
    date_to: Date,
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
    restricted_to_services: [String],
    possible_appointment: Number,
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
