const Joi = require("joi");
const pointValidation = require("./genericValidations");
Joi.ObjectID = require("joi-objectid");

const schootingsValidation = (data) => {
  const schema = Joi.object({
    user_id: Joi.ObjectID(),
    animal_specis: Joi.string().max(32).allow(null).allow(""),
    gender: Joi.string().pattern(new RegExp(/^(a|w)$/)),
    weight: Joi.number(),
    age: Joi.number().integer(),
    date: Joi.date(),
    hunting_ground: Joi.string().max(64).allow(null).allow(""),
    raised_hide: Joi.string().max(64).allow(null).allow(""),
    comment: Joi.string().max(400).allow(null).allow(""),
    shooting_position: pointValidation,
    hit_position: pointValidation,
    found_position: pointValidation,
    distance: Joi.number().integer(),
    weapon: Joi.string().max(64),
  });
  return schema.validate(data);
};

module.exports.schootingsValidation = schootingsValidation;
