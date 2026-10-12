import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check if response already committed
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  // Security: Never leak database or internal stack traces to the client
  res.status(statusCode).json({
    error: err.userMessage || (statusCode === 500 ? 'Internal server error' : err.message),
    ...(isDev && err.details ? { details: err.details } : {}),
  });
}
