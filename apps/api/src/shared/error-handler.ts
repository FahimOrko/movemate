import type { ErrorBody } from '@movemate/contracts';
import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError, z } from 'zod';
import { AppError } from './errors';

type ErrorResponse = { status: number; body: ErrorBody };

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const { status, body } = toErrorResponse(error);
  res.status(status).json(body);
};

function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return errorResponse(error.status, error.code, error.message);
  }
  if (error instanceof ZodError) {
    return errorResponse(400, 'validation_error', z.prettifyError(error));
  }
  if (error instanceof MulterError) {
    return error.code === 'LIMIT_FILE_SIZE'
      ? errorResponse(413, 'payload_too_large', 'The photo is too large')
      : errorResponse(400, 'validation_error', 'Send exactly one photo in the "file" field');
  }
  if (isMalformedJsonBody(error)) {
    return errorResponse(400, 'validation_error', 'Request body is not valid JSON');
  }
  console.error(error);
  return errorResponse(500, 'internal_error', 'Something went wrong');
}

function errorResponse(status: number, code: string, message: string): ErrorResponse {
  return { status, body: { error: { code, message } } };
}

// express.json() reports unparsable bodies as a SyntaxError carrying the raw body.
function isMalformedJsonBody(error: unknown): boolean {
  return error instanceof SyntaxError && 'body' in error;
}
