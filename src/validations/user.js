const Joi = require('joi');

// * Register Validation
const registerValidation = data => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(32).alphanum().required(),
    password: Joi.string()
      .min(8)
      .max(32)
      .required()
      .pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:#;<>,.?\/~_+\-=|]).{8,32}$/)),
    email: Joi.string().min(6).required().email(),
    scopes: Joi.array().items(Joi.string().max(16)).max(16),
    firstName: Joi.string().min(2).max(32).alphanum().required(),
    lastName: Joi.string().min(2).max(32).alphanum().required(),
    initials: Joi.string().min(2).max(2).alphanum(),
  });
  return schema.validate(data);
};

// * Login Validation
const loginValidation = data => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(32).alphanum().required(),
    refreshTokens: Joi.array().items(Joi.string()),
    password: Joi.string()
      .min(8)
      .max(32)
      .required()
      .pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:#;<>,.?\/~_+\-=|]).{8,32}$/)),
    rememberMe: Joi.boolean(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
