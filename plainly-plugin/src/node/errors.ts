export class CollectFootageError extends Error {
  errorPaths: string[];
  constructor(errorPaths: string[]) {
    super(
      `Could not collect footage for the following paths: ${errorPaths.join(', ')}`,
    );
    this.errorPaths = errorPaths;
  }
}

export class CollectFontsError extends Error {
  errorPaths: string[];
  constructor(errorPaths: string[]) {
    super(
      `Could not collect fonts for the following paths: ${errorPaths.join(', ')}`,
    );
    this.errorPaths = errorPaths;
  }
}

export enum ErrorCode {
  /**
   * Client-side errors (not sent by the backend)
   */
  GENERAL_NO_INTERNET_CONNECTION = 'GENERAL_NO_INTERNET_CONNECTION',
  GENERAL_NO_ACCESS_TOKEN = 'GENERAL_NO_ACCESS_TOKEN',
  GENERAL_CLIENT_SIDE_ERROR = 'GENERAL_CLIENT_SIDE_ERROR',
  GENERAL_SERVER_SIDE_ERROR = 'GENERAL_SERVER_SIDE_ERROR',
  GENERAL_COMMUNICATION_ERROR = 'GENERAL_COMMUNICATION_ERROR',
  GENERAL_TOO_MANY_REQUESTS = 'GENERAL_TOO_MANY_REQUESTS',
  GENERAL_UNAUTHORIZED = 'GENERAL_UNAUTHORIZED',
  GENERAL_FORBIDDEN = 'GENERAL_FORBIDDEN',
}

export class ApiErrorResponseData {
  status?: number;
  error?: string;
  message?: string;
  errors?: {
    codes?: string[];
    defaultMessage?: string;
    field?: string;
  }[];
}

/**
 * Main api error class.
 */
export class PlainlyApiError extends Error {
  public code: ErrorCode;
  public generalError?: boolean;
  public errorMessage?: string;
  public errors?: ApiErrorResponseData['errors'];

  constructor(
    code: ErrorCode,
    generalError?: boolean,
    errorMessage?: string,
    errors?: ApiErrorResponseData['errors'],
    name = 'PlainlyApiError',
  ) {
    super(errorMessage || code.toString());
    this.code = code;
    this.generalError = generalError;
    this.errorMessage = errorMessage;
    this.name = `${name}[${code.toString()}]`;
    this.errors = errors;

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, PlainlyApiError.prototype);
  }
}

/**
 * This is error that denotes there is no internet connection.
 */
export class NoInternetConnectionApiError extends PlainlyApiError {
  constructor() {
    super(
      ErrorCode.GENERAL_NO_INTERNET_CONNECTION,
      true,
      'NoInternetConnectionApiError',
    );

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, NoInternetConnectionApiError.prototype);
  }
}

/**
 * This is error that denotes there is no access token.
 */
export class NoAccessTokenApiError extends PlainlyApiError {
  constructor() {
    super(ErrorCode.GENERAL_NO_ACCESS_TOKEN, true, 'NoAccessTokenApiError');

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, NoAccessTokenApiError.prototype);
  }
}

/**
 * This is error that denotes there is a 4xx response with an acceptable status like (f.e. 401).
 */
export class AcceptableClientSideApiError extends PlainlyApiError {
  public statusCode: number;

  constructor(errorCode: ErrorCode, statusCode: number) {
    super(
      errorCode,
      true,
      undefined,
      undefined,
      'AcceptableClientSideApiError',
    );
    this.statusCode = statusCode;

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, AcceptableClientSideApiError.prototype);
  }
}

/**
 * This is error that denotes there is a 4xx response.
 */
export class ClientSideApiError extends PlainlyApiError {
  public statusCode: number;

  constructor(
    statusCode: number,
    errorMessage?: string,
    errors?: ApiErrorResponseData['errors'],
  ) {
    super(
      ErrorCode.GENERAL_CLIENT_SIDE_ERROR,
      true,
      errorMessage,
      errors,
      'ClientSideApiError',
    );
    this.statusCode = statusCode;

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ClientSideApiError.prototype);
  }
}

/**
 * This is error that denotes there is a 5xx response.
 */
export class ServerSideApiError extends PlainlyApiError {
  public statusCode: number;

  constructor(
    statusCode: number,
    errorMessage?: string,
    errors?: ApiErrorResponseData['errors'],
  ) {
    super(
      ErrorCode.GENERAL_SERVER_SIDE_ERROR,
      true,
      errorMessage,
      errors,
      'ServerSideApiError',
    );
    this.statusCode = statusCode;

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ServerSideApiError.prototype);
  }
}

/**
 * This is error that denotes there is a 5xx response.
 */
export class GeneralCommunicationApiError extends PlainlyApiError {
  constructor(errorMessage?: string, errors?: ApiErrorResponseData['errors']) {
    super(
      ErrorCode.GENERAL_COMMUNICATION_ERROR,
      true,
      errorMessage,
      errors,
      'GeneralCommunicationApiError',
    );

    // Set the prototype explicitly.
    // see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, GeneralCommunicationApiError.prototype);
  }
}

const CODE_MESSAGE_MAP: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.GENERAL_NO_INTERNET_CONNECTION]:
    'Looks like you are currently not connected to the Internet.',
  [ErrorCode.GENERAL_NO_ACCESS_TOKEN]: 'Please re-authenticate.',
  [ErrorCode.GENERAL_CLIENT_SIDE_ERROR]:
    'An unexpected client-side Plainly error occurred.',
  [ErrorCode.GENERAL_SERVER_SIDE_ERROR]:
    'An unexpected server-side Plainly error occurred.',
  [ErrorCode.GENERAL_COMMUNICATION_ERROR]:
    'We are having unexpected difficulties communicating with the Plainly servers. Please try again later.',
  [ErrorCode.GENERAL_TOO_MANY_REQUESTS]:
    "It seems like we're receiving a lot of requests at the moment. Please take a breather and try again in a few moments. We apologize for any inconvenience!",
  [ErrorCode.GENERAL_UNAUTHORIZED]:
    'No valid authentication credentials to perform this action.',
  [ErrorCode.GENERAL_FORBIDDEN]:
    'You are not authorized to perform this action.',
};

export const getErrorDescription = (
  details?: unknown,
): { description?: string; code?: string } | undefined => {
  if (!details) return undefined;

  if (typeof details === 'string') return { description: details };

  if (details instanceof PlainlyApiError) {
    const { code, errorMessage, message } = details;
    const codes = (details.errors || [])
      .map((error) => error.codes?.[0])
      .filter((code): code is string => Boolean(code));
    const codesSuffix = codes.length > 0 ? ` (${codes.join(', ')})` : '';

    const resolvedMessage = CODE_MESSAGE_MAP[code] || errorMessage || message;
    return { description: `${resolvedMessage}${codesSuffix}`, code: code };
  }

  if (details instanceof Error) return { description: details.message };

  return { description: String(details) };
};
