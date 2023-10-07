import Joi from "joi";

const signinSchema = Joi.object().keys({
  email: Joi.string().email().required().allow(""),
  password: Joi.string().required().allow(""),
})

export default {
  signinSchema,
};
