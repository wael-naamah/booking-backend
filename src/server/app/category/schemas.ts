import Joi from "joi";
import { DisplayStatus } from "../../../database-client";

const getCategoriesSchema = Joi.object().keys({
  search: Joi.string().trim().optional().allow(""),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});

const servicesListSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  duration: Joi.number().required(),
  price: Joi.number().required(),
  abbreviation_id: Joi.number().required(),
});

const settingsSchema = Joi.object({
  sorting_order: Joi.string().required(),
  show_performance_in_summary: Joi.boolean().required(),
  show_service_in_email: Joi.boolean().required(),
  info_display_type: Joi.string().required(),
  show_performance_on: Joi.string().required(),
}).required();

const addCategorySchema = Joi.object().keys({
  name: Joi.string().required(),
  category: Joi.string().required(),
  choices: Joi.string().optional(),
  selection_is_optional: Joi.boolean().optional(),
  show_price: Joi.boolean().optional(),
  show_appointment_duration: Joi.boolean().optional(),
  no_columns_of_services: Joi.number().required(),
  full_screen: Joi.boolean().optional(),
  folded: Joi.boolean().optional(),
  online_booking: Joi.boolean().optional(),
  remarks: Joi.string().optional(),
  unique_id: Joi.number().required(),
  display_status:  Joi.string()
  .valid(...Object.values(DisplayStatus))
  .optional(),
  advanced_settings: settingsSchema,
  services: Joi.array().items(servicesListSchema).required().min(1),
});

const updateCategorySchema = addCategorySchema

export default {
  getCategoriesSchema,
  addCategorySchema,
  updateCategorySchema,
};
