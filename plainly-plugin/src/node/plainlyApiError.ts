type PlainlyApiValidationErrorArgument = {
  codes?: string[];
  arguments?: unknown[] | null;
  defaultMessage?: string;
  code?: string;
};

type PlainlyApiValidationError = {
  codes?: string[];
  arguments?: PlainlyApiValidationErrorArgument[];
  defaultMessage?: string;
  objectName?: string;
  field?: string;
  rejectedValue?: unknown;
  bindingFailure?: boolean;
  code?: string;
};

export type PlainlyApiErrorResponse = {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  errors?: PlainlyApiValidationError[];
  path?: string;
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
