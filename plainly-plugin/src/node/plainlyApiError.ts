type PlainlyApiValidationError = {
  codes?: string[];
};

export type PlainlyApiErrorResponse = {
  error?: string;
  message?: string;
  errors?: PlainlyApiValidationError[];
};

export function isPlainlyApiErrorResponse(
  data: unknown,
): data is PlainlyApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('error' in data || 'message' in data || 'errors' in data)
  );
}

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
