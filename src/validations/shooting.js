const config = require('../../config');
const Joi = require('joi');
Joi.objectID = require('joi-objectid')(Joi);

const shootingValidation = data => {
  const schema = Joi.object({
    _id: Joi.objectID(),
    user_id: Joi.objectID().required(),
    animal_specis: Joi.string().max(32),
    gender: Joi.string().valid('m', 'w', 'unknown'),
    weight: Joi.number(),
    age: Joi.number().integer(),
    date: Joi.date().timestamp().required(),
    hunting_ground: Joi.string().max(64),
    raised_hide: Joi.string().max(64),
    comment: Joi.string().max(400),
    distance: Joi.number().integer(),
    weapon: Joi.string().max(64),
    avatar: Joi.string(),
    delAvatar: Joi.string(),
    images: Joi.array().items(Joi.string()),
    delImages: Joi.array().items(Joi.string()),
  });
  return schema.validate(data);
};

module.exports.shootingValidation = shootingValidation;
