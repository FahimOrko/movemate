const statusByCode = {
  validation_error: 400,
  not_found: 404,
  invalid_phase_transition: 409,
  internal_error: 500,
  db_unavailable: 503,
} as const;

export type ErrorCode = keyof typeof statusByCode;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = statusByCode[code];
  }
}
