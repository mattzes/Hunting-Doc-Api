const Joi = require('joi');

const passwordPattern = new RegExp(
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*!@$%^&(){}[\]:#;<>,.?\/~_+\-=|])(?:[[0-9]|[a-z]|[A-Z]|[*!@$%^&(){}[\]:#;<>,?\/~_+\-=|]){8,32}$/
);
const usernamePattern = new RegExp(/^(?!.*[_.-]{2})[0-9a-zA-Z_.-]+$/);

// * Register Validation
const registerValidation = data => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(32).required().pattern(usernamePattern),
    password: Joi.string().min(8).max(32).required().pattern(passwordPattern),
    email: Joi.string().required().email(),
    scopes: Joi.object({
      isAdmin: Joi.bool(),
    }),
    firstName: Joi.string().min(2).max(32).required(),
    lastName: Joi.string().min(2).max(32).required(),
    initials: Joi.string().min(2).max(2),
  });
  return schema.validate(data);
};

// * Login Validation
const loginValidation = data => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(32).required().pattern(usernamePattern),
    refreshTokens: Joi.array().items(Joi.string()),
    password: Joi.string().min(8).max(32).required().pattern(passwordPattern),
    rememberMe: Joi.bool(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
