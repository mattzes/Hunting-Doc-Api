const Joi = require("joi");

const pointValidation = Joi.object({
  type: Joi.string().required().default("Point").valid("Point"),
  coordinates: Joi.array().required().items(Joi.number()),
});

module.exports.pointValidation = pointValidation;
