import Joi from "joi";

const sendEmailSchema = Joi.object().keys({
  to: Joi.string().email().required(),
  subject: Joi.string().required(),
  text: Joi.string().required(),
});

const addEmailConfigSchema = Joi.object().keys({
  sender: Joi.string().email().required(),
  server: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  port: Joi.number().required(),
  ssl_enabled: Joi.boolean().required(),
});

const updateEmailConfigSchema = Joi.object().keys({
  sender: Joi.string().email().required(),
  server: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  port: Joi.number().required(),
  ssl_enabled: Joi.boolean().required(),
});

export default {
  sendEmailSchema,
  addEmailConfigSchema,
  updateEmailConfigSchema,
};
