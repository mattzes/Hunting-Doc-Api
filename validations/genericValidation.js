const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const idValidation = (data) => {
  const schema = Joi.object({
    _id: Joi.objectID().required(),
  });
  return schema.validate(data);
};

module.exports.idValidation = idValidation;
