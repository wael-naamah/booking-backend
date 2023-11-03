import Joi from "joi";
import { ScheduleType, WeekDay } from "../../../database-client";

const getSchedulesSchema = Joi.object().keys({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});

const addScheduleSchema = Joi.object().keys({
  calendar_id: Joi.string().required(),
  working_hours_type: Joi.string().valid(...Object.values(ScheduleType)).required(),
  day: Joi.alternatives().try(
    Joi.string().valid(...Object.values(WeekDay)),
    Joi.date()
  ).required(),
  time_from: Joi.string().required(),
  time_to: Joi.string().required(),
  reason: Joi.string().optional(),
  deactivate_working_hours: Joi.boolean().optional(),
  one_time_appointment_link: Joi.string().optional(),
  only_internally: Joi.boolean().optional(),
  restricted_to_services: Joi.array().items(Joi.string()).optional(),
  possible_appointment: Joi.number().optional(),
  active: Joi.boolean().optional()
});

const updateScheduleSchema = addScheduleSchema


export default {
  getSchedulesSchema,
  addScheduleSchema,
  updateScheduleSchema,
};
