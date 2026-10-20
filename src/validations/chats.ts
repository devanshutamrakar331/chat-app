import Joi from "joi";

export const createChats = {
  body: Joi.object({
    session_name: Joi.string()
      .trim()
      .when("type", { is: "GROUP", then: Joi.required(), otherwise: Joi.forbidden() })
      .label("Session Name"),
    type: Joi.string().trim().required().valid("PRIVATE", "GROUP").label("Type"),
    initiated_by_id: Joi.number()
      .integer()
      .when("type", { is: "GROUP", then: Joi.required(), otherwise: Joi.forbidden() })
      .label("Initiated By Id"),
    user_id: Joi.array().items(Joi.number().integer().required()).min(1).required().label("User Ids"),
  }).options({ abortEarly: false }),
};

export const sendMessage = {
  params: Joi.object({
    chatId: Joi.number().integer().required().label("Chat Id"),
  }).options({ abortEarly: false }),

  body: Joi.object({
    sender_id: Joi.number().integer().required().label("Sender Id"),
    message: Joi.string().trim().required().label("Message"),
  }).options({ abortEarly: false }),
};

export const getMessages = {
  params: Joi.object({
    chatId: Joi.number().integer().required().label("Chat Id"),
  }).options({ abortEarly: false }),

  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).label("Limit"),
  }).options({ abortEarly: false }),
};

export const markMessageRead = {
  params: Joi.object({
    chatId: Joi.number().integer().positive().required().label("Chat Id"),
    messageId: Joi.string().trim().pattern(/^[^/]+$/).max(1500).required().label("Message Id"),
  }).options({ abortEarly: false }),

  body: Joi.object({
    userId: Joi.number().integer().positive().required().label("User Id"),
  }).options({ abortEarly: false }),
};

export const updateLastSeen = {
  params: Joi.object({
    chatId: Joi.number().integer().positive().required().label("Chat Id"),
  }).options({ abortEarly: false }),

  body: Joi.object({
    userId: Joi.number().integer().positive().required().label("User Id"),
    messageId: Joi.string().trim().pattern(/^[^/]+$/).max(1500).required().label("Message Id"),
  }).options({ abortEarly: false }),
};
