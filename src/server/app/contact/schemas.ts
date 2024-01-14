import Joi from "joi";
import { Salutation } from "../../../database-client";

const getContactsSchema = Joi.object().keys({
  search: Joi.string().trim().optional().allow(""),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});


const addContactSchema = Joi.object().keys({
  salutation: Joi.string().valid(...Object.values(Salutation)),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  phone_numbber_2: Joi.string().optional().allow(""),
  phone_numbber_3: Joi.string().optional().allow(""),
  email: Joi.string().email().required(),
  note_on_address: Joi.string().optional().allow(""),
  newsletter: Joi.boolean().optional(),
  categories_permission: Joi.array().items(Joi.string()).optional(),
  remarks: Joi.string().optional().allow(""),
});

const updateContactSchema = Joi.object().keys({
  salutation: Joi.string().valid(...Object.values(Salutation)),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  phone_numbber_2: Joi.string().optional().allow(""),
  phone_numbber_3: Joi.string().optional().allow(""),
  email: Joi.string().email().required(),
  note_on_address: Joi.string().optional().allow(""),
  newsletter: Joi.boolean().optional(),
  categories_permission: Joi.array().items(Joi.string()).optional(),
  remarks: Joi.string().optional().allow(""),
});


export default {
  getContactsSchema,
  addContactSchema,
  updateContactSchema,
};
