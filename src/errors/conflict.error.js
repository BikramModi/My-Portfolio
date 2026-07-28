class ConflictError extends Error {
  constructor(message = "Conflict") {
    super(message);

    this.name = "ConflictError";
    this.statusCode = 409;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ConflictError;