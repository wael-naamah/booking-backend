import Joi from "joi";
import contactSchema from "../contact/schemas";

const getAppointmentsSchema = Joi.object().keys({
  start: Joi.date().iso().required(),
  end: Joi.date().iso().required(),
  search: Joi.string().trim().optional().allow(""),
});

const addAppointmentSchema = Joi.object().keys({
  category_id: Joi.string().required(),
  service_id: Joi.string().required(),
  calendar_id: Joi.string().required(),
  start_date: Joi.date()
    .iso()
    .required()
    .min(new Date().toISOString())
    .messages({
      "date.min":
        "start_date must be equal to or greater than the current date",
    }),
  end_date: Joi.date().iso().required().min(Joi.ref("start_date")).messages({
    "date.min": "end_date must be after start_date",
  }),
  contact: contactSchema.addContactSchema,
});

const updateAppointmentSchema = Joi.object().keys({
  category_id: Joi.string().required(),
  service_id: Joi.string().required(),
  calendar_id: Joi.string().required(),
  start_date: Joi.date()
    .iso()
    .required()
    .min(new Date().toISOString())
    .messages({
      "date.min":
        "start_date must be equal to or greater than the current date",
    }),
  end_date: Joi.date().iso().required().min(Joi.ref("start_date")).messages({
    "date.min": "end_date must be after start_date",
  }),
  contact_id: Joi.string().required(),
});;

const getTimeSlotsSchema = Joi.object().keys({
  date: Joi.date().iso().required(),
  category_id: Joi.string().optional(),
  service_id: Joi.string().optional(),
});

export default {
  getAppointmentsSchema,
  addAppointmentSchema,
  updateAppointmentSchema,
  getTimeSlotsSchema,
};
