const Joi = require('joi');

const passwordPattern = new RegExp(
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*!@$%^&(){}[\]:#;<>,.?\/~_+\-=|])(?:[0-9a-zA-Z*!@$%^&(){}[\]:#;<>,?\/~_+\-=|]){8,32}$/
);
const usernamePattern = new RegExp(/^(?!.*[_.-]{2})[0-9a-zA-Z_.-]+$/);
const passwordErrorMessage =
  'The password does not fit the requirements. It should contain uppercase letters, lowercase letters, numbers and special characters.';
const usernameErrorMessage =
  'The username does not fit the requirements. Only uppercase letters, lowercase letters, numbers and "_.-". The special characters must not be repeated';

// * Register Validation
const registerValidation = data => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(32).required().pattern(usernamePattern).messages({
      'string.pattern.base': usernameErrorMessage,
    }),
    password: Joi.string().min(8).max(32).required().pattern(passwordPattern).messages({
      'string.pattern.base': passwordErrorMessage,
    }),
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
    username: Joi.string().min(6).max(32).required().pattern(usernamePattern).messages({
      'string.pattern.base': usernameErrorMessage,
    }),
    refreshTokens: Joi.array().items(Joi.string()),
    password: Joi.string().min(8).max(32).required().pattern(passwordPattern).messages({
      'string.pattern.base': passwordErrorMessage,
    }),
    rememberMe: Joi.bool(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
