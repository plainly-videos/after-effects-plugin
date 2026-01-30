import {
  ClientSideApiError,
  ErrorCode,
  getErrorDescription,
  PlainlyApiError,
} from '../src/node/errors';

describe('getErrorDescription', () => {
  it('formats Plainly API errors with status, message, and first codes', () => {
    const error = new ClientSideApiError(400, 'Bad request', [
      { codes: ['CODE_1', 'CODE_1B'] },
      { codes: ['CODE_2'] },
      { codes: [] },
      {},
    ]);

    expect(getErrorDescription(error)).toBe(
      '[GENERAL_CLIENT_SIDE_ERROR]: Bad request (CODE_1, CODE_2)',
    );
  });

  it('falls back to error code when no status code exists', () => {
    const error = new PlainlyApiError(
      ErrorCode.GENERAL_FORBIDDEN,
      true,
      'Forbidden',
      [{ codes: ['CODE_3'] }],
    );

    expect(getErrorDescription(error)).toBe(
      '[GENERAL_FORBIDDEN]: Forbidden (CODE_3)',
    );
  });

  it('uses the message for non-Plainly errors', () => {
    expect(getErrorDescription(new Error('Boom'))).toBe('Boom');
  });

  it('returns strings as-is', () => {
    expect(getErrorDescription('Something went wrong')).toBe(
      'Something went wrong',
    );
  });

  it('returns undefined for empty input', () => {
    expect(getErrorDescription(undefined)).toBeUndefined();
  });

  it('stringifies non-error values', () => {
    expect(getErrorDescription(123)).toBe('123');
  });
});
