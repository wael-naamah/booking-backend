import Joi from "joi";
import { Salutation } from "../../../database-client";

const getAppointmentsSchema = Joi.object().keys({
  start: Joi.date().iso().required(),
  end: Joi.date().iso().required(),
  search: Joi.string().trim().optional().allow(""),
});

const attachmentSchema = Joi.object({
  title: Joi.string().allow(""),
  url: Joi.string().allow(""),
});

const addAppointmentSchema = Joi.object().keys({
  category_id: Joi.string().required(),
  service_id: Joi.string().required(),
  start_date: Joi.date().iso().required().min(new Date().toISOString()).messages({
    "date.min": "start_date must be equal to or greater than the current date",
  }),
  end_date: Joi.date().iso().required().min(Joi.ref("start_date")).messages({
    "date.min": "end_date must be after start_date",
  }),
  assign_to: Joi.string().optional(),
  salutation: Joi.string().valid(...Object.values(Salutation)),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  email: Joi.string().email().required(),
  brand_of_device: Joi.string().optional(),
  model: Joi.string().optional(),
  exhaust_gas_measurement: Joi.boolean().optional(),
  has_maintenance_agreement: Joi.boolean().optional(),
  has_bgas_before: Joi.boolean().optional(),
  year: Joi.string().optional(),
  remarks: Joi.string().optional(),
  attachment: attachmentSchema,
  remember_entries: Joi.boolean().optional(),
});

const updateAppointmentSchema = Joi.object().keys({
  service_abbreviation_id: Joi.number().required(),
  start_date: Joi.date().iso().required().min(new Date().toISOString()).messages({
    "date.min": "start_date must be equal to or greater than the current date",
  }),
  end_date: Joi.date().iso().required().min(Joi.ref("start_date")).messages({
    "date.min": "end_date must be after start_date",
  }),
  assign_to: Joi.string().optional(),
  salutation: Joi.string().valid(...Object.values(Salutation)),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  email: Joi.string().email().required(),
  brand_of_device: Joi.string().optional(),
  model: Joi.string().optional(),
  exhaust_gas_measurement: Joi.boolean().optional(),
  has_maintenance_agreement: Joi.boolean().optional(),
  has_bgas_before: Joi.boolean().optional(),
  year: Joi.string().optional(),
  remarks: Joi.string().optional(),
  attachment: attachmentSchema,
  remember_entries: Joi.boolean().optional(),
});


export default {
  getAppointmentsSchema,
  addAppointmentSchema,
  updateAppointmentSchema,
};
