type PlainlyApiValidationError = {
  codes?: string[];
};

export type PlainlyApiErrorResponse = {
  error?: string;
  message?: string;
  errors?: PlainlyApiValidationError[];
};

export class PlainlyApiError extends Error {
  status?: number;
  data?: PlainlyApiErrorResponse | string | unknown;

  constructor({
    message,
    status,
    data,
  }: {
    message: string;
    status?: number;
    data?: unknown;
  }) {
    super(message);
    this.name = 'PlainlyApiError';
    this.status = status;
    this.data = data;
  }
}
