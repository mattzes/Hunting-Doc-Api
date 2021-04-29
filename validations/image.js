const Joi = require("joi");
Joi.ObjectID = require("joi-objectid");

const imagesValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(5).max(32).alphanum(),
    schooting_id: Joi.ObjectID(),
    data: Joi.binary().required(),
  });
  return schema.validate(data);
};

module.exports.imagesValidation = imagesValidation;
