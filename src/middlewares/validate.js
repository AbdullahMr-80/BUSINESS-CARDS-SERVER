export function validateBody(schema) {
  return async (req, _res, next) => {
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = value;
      next();
    } catch (err) {
      const msgs = err?.details?.map((d) => d.message) ?? [
        "Invalid request body",
      ];
      next(Object.assign(new Error(msgs.join("; ")), { status: 400 }));
    }
  };
}

/** Validate and sanitize query params with Joi */

export function validateQuery(schema) {
  return async (req, _res, next) => {
    try {
      const value = await schema.validateAsync(req.query, {
        convert: true,
        abortEarly: false,
        stripUnknown: true,
      });
      req.validatedQuery = value;
      next();
    } catch (err) {
      const msgs = err?.details?.map((d) => d.message) ?? [
        "Invalid query params",
      ];
      next(Object.assign(new Error(msgs.join("; ")), { status: 400 }));
    }
  };
}
