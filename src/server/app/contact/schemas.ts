import Joi from "joi";
import { Salutation } from "../../../database-client";

const getContactsSchema = Joi.object().keys({
  search: Joi.string().trim().optional().allow(""),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});

const attachmentSchema = {
  title: Joi.string().allow(""),
  url: Joi.string().allow(""),
};

const addContactSchema = Joi.object().keys({
  salutation: Joi.string().valid(...Object.values(Salutation)),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  phone_numbber_2: Joi.string().optional(),
  phone_numbber_3: Joi.string().optional(),
  email: Joi.string().email().required(),
  note_on_address: Joi.string().optional(),
  brand_of_device: Joi.string().optional(),
  model: Joi.string().optional(),
  exhaust_gas_measurement: Joi.boolean().optional(),
  has_maintenance_agreement: Joi.boolean().optional(),
  has_bgas_before: Joi.boolean().optional(),
  year: Joi.string().optional(),
  invoice_number: Joi.number().optional(),
  newsletter: Joi.boolean().optional(),
  remarks: Joi.string().optional(),
  attachments: Joi.array().items(attachmentSchema),
  categories_permission: Joi.array().items(Joi.string()).optional(),
});

const updateContactSchema = Joi.object().keys({
  salutation: Joi.string().valid(...Object.values(Salutation)),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  phone_numbber_2: Joi.string().optional(),
  phone_numbber_3: Joi.string().optional(),
  email: Joi.string().email().required(),
  note_on_address: Joi.string().optional(),
  brand_of_device: Joi.string().optional(),
  model: Joi.string().optional(),
  exhaust_gas_measurement: Joi.boolean().optional(),
  has_maintenance_agreement: Joi.boolean().optional(),
  has_bgas_before: Joi.boolean().optional(),
  year: Joi.string().optional(),
  invoice_number: Joi.number().optional(),
  newsletter: Joi.boolean().optional(),
  remarks: Joi.string().optional(),
  attachments: Joi.array().items(attachmentSchema),
  categories_permission: Joi.array().items(Joi.string()).optional(),
});


export default {
  getContactsSchema,
  addContactSchema,
  updateContactSchema,
};
