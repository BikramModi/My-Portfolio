import { validationResult } from "express-validator";
import ValidationError from "../errors/validation.error.js";

const validationMiddleware =
  (validators = []) =>
  async (req, res, next) => {
    try {
      await Promise.all(validators.map((validator) => validator.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formatted = errors.array().map(({ path, msg }) => ({
          path,
          msg,
        }));
        return next(new ValidationError(formatted));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };

export default validationMiddleware;
