const Joi = require('joi');
Joi.objectID = require('joi-objectid')(Joi);

const shootingValidation = data => {
  const schema = Joi.object({
    user_id: Joi.objectID().required(),
    animal_specis: Joi.string().max(32),
    gender: Joi.string().valid('m', 'w', 'unknown'),
    weight: Joi.number(),
    age: Joi.number().integer(),
    date: Joi.date().timestamp().required(),
    hunting_ground: Joi.string().max(64),
    raised_hide: Joi.string().max(64),
    comment: Joi.string().max(400),
    shooting_position: Joi.array().items(Joi.number()).max(2),
    hit_position: Joi.array().items(Joi.number()).max(2),
    found_position: Joi.array().items(Joi.number()).max(2),
    distance: Joi.number().integer(),
    weapon: Joi.string().max(64),
    images: Joi.array(),
  });
  return schema.validate(data);
};

module.exports.shootingValidation = shootingValidation;
