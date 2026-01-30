import {
  AcceptableClientSideApiError,
  ClientSideApiError,
  ErrorCode,
  GeneralCommunicationApiError,
  NoInternetConnectionApiError,
  PlainlyApiError,
  ServerSideApiError,
} from '../src/node/errors';
import { toPlainlyError } from '../src/node/request';

const makeAxiosError = (response?: unknown) => ({
  isAxiosError: true,
  response,
});

describe('toPlainlyError', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      configurable: true,
    });
  });

  it('returns no-internet error when offline', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      configurable: true,
    });

    const error = toPlainlyError(new Error('Network down'));

    expect(error).toBeInstanceOf(NoInternetConnectionApiError);
  });

  it('returns communication error for non-axios errors when online', () => {
    const error = toPlainlyError('boom');

    expect(error).toBeInstanceOf(GeneralCommunicationApiError);
    expect(error.message).toBe('boom');
  });

  it('returns communication error for axios errors without response', () => {
    const error = toPlainlyError(makeAxiosError());

    expect(error).toBeInstanceOf(GeneralCommunicationApiError);
  });

  it('returns plainly api error when error code header is present', () => {
    const response = {
      status: 400,
      headers: { 'x-plainlyerrorcode': ErrorCode.GENERAL_FORBIDDEN },
      data: {
        message: 'Forbidden',
        errors: [{ codes: ['CODE_1'] }],
      },
    };

    const error = toPlainlyError(makeAxiosError(response));

    expect(error).toBeInstanceOf(PlainlyApiError);
    expect(error.code).toBe(ErrorCode.GENERAL_FORBIDDEN);
  });

  it('returns server-side error for 5xx responses', () => {
    const response = {
      status: 500,
      headers: {},
      data: { message: 'Server error' },
    };

    const error = toPlainlyError(makeAxiosError(response));

    expect(error).toBeInstanceOf(ServerSideApiError);
  });

  it('returns acceptable client error for known status codes', () => {
    const response = {
      status: 401,
      headers: {},
      data: { message: 'Unauthorized' },
    };

    const error = toPlainlyError(makeAxiosError(response));

    expect(error).toBeInstanceOf(AcceptableClientSideApiError);
    expect(error.code).toBe(ErrorCode.GENERAL_UNAUTHORIZED);
  });

  it('returns client-side error for other 4xx responses', () => {
    const response = {
      status: 422,
      headers: {},
      data: { message: 'Bad request' },
    };

    const error = toPlainlyError(makeAxiosError(response));

    expect(error).toBeInstanceOf(ClientSideApiError);
  });

  it('returns communication error for non-4xx/5xx responses without header code', () => {
    const response = {
      status: 200,
      headers: {},
      data: { message: 'Unexpected error' },
    };

    const error = toPlainlyError(makeAxiosError(response));

    expect(error).toBeInstanceOf(GeneralCommunicationApiError);
  });
});
