import mongoose, { Schema } from "mongoose";
import {
  AppointmentCluster,
  AppointmentDuration,
  AppointmentScheduling,
  AssignmentOfServices,
  CalendarType,
  DescriptionDisplayType,
  InsertAppointmentOption,
} from "../Schema";

export const calendarAdvancedSettingsSchema = new Schema(
  {
    multiple_occupanc: Boolean,
    notification_email: String,
    notification_email_as_sender: Boolean,
    sms_notification: Boolean,
    manual_email_confirmation: String,
    manually_confirmation_for_manually_booked_appointments: Boolean,
    limit_maximum_appointment_duration: Boolean,
    call_waiting_number: Boolean,
    within_availability_times: Boolean,
    calendar_group: String,
    calendar_type: {
      type: String,
      enum: CalendarType,
      default: CalendarType.Main,
      required: false,
    },
    appointment_cluster: {
      type: String,
      enum: AppointmentCluster,
      default: AppointmentCluster.GLOBAL,
      required: false,
    },
    appointment_duration: {
      type: String,
      enum: AppointmentDuration,
      default: AppointmentDuration.Auto,
      required: false,
    },
    calendar_order: Number,
    duration_factor: Number,
    reference_system: String,
    calendar_id: Number,
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
    employee_name: {
      type: String,
      required: true,
    },
    description: String,
    show_description: {
      type: String,
      enum: DescriptionDisplayType,
      default: DescriptionDisplayType.None,
      required: false,
    },
    appointment_scheduling: {
      type: String,
      enum: AppointmentScheduling,
      default: AppointmentScheduling.APPOINTMENT_LENGTH,
      required: false,
    },
    employee_image: String,
    online_booked: Boolean,
    advanced_settings: calendarAdvancedSettingsSchema,
    assignment_of_services: {
      type: String,
      enum: AssignmentOfServices,
      default: AssignmentOfServices.ALL,
      required: false,
    },
    assignments_services: [String],
    link_calendar: Boolean,
    priority_link: Number,
    skills: [
      {
        service: String,
        level: Number,
      },
    ],
    paired_calendars: [String],
    insert_appointments: {
      type: String,
      enum: InsertAppointmentOption,
      default: InsertAppointmentOption.FIRST,
      required: false,
    },
    coupling_on_certain_services: Boolean,
    certain_services: [String],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
