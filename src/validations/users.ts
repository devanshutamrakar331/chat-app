import Joi from "joi";


export const createUser = {
    body: Joi.object({
      name : Joi.string().trim().required().label("Name"),
      password: Joi.string().trim().min(8).required().label("Password"),
      mobile_no: Joi.string().trim().pattern(/^[0-9]{10}$/).required().label("Mobile No.")
        .messages({ "string.pattern.base": "Mobile No. must be exactly 10 digits" })
    }).options({ abortEarly: false })
};

export const getUserChats = {
  params: Joi.object({
    userId: Joi.number().integer().positive().required().label("User Id"),
  }).options({ abortEarly: false }),
};
