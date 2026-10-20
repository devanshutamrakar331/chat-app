import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "express-validation";
import ApiError from "../utils/ApiError.js";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: "Validation failed",
      errors: err.details,
    });
  }

  let statusCode = 500;
  let message = "Something went wrong";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error && err.message) {
    message = err.message;
  }

  if (statusCode === 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof ApiError && err.errors ? { errors: err.errors } : {}),
  });
};
