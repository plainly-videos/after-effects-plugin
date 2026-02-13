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

    const { description, code } = getErrorDescription(error) || {};

    expect(description).toBe('Bad request (CODE_1, CODE_2)');
    expect(code).toBe(ErrorCode.GENERAL_CLIENT_SIDE_ERROR);
  });

  it('falls back to error code when no status code exists', () => {
    const error = new PlainlyApiError(
      ErrorCode.GENERAL_FORBIDDEN,
      true,
      'Forbidden',
      [{ codes: ['CODE_3'] }],
    );

    const { description, code } = getErrorDescription(error) || {};

    expect(description).toBe('Forbidden (CODE_3)');
    expect(code).toBe(ErrorCode.GENERAL_FORBIDDEN);
  });

  it('uses the message for non-Plainly errors', () => {
    const { description } = getErrorDescription(new Error('Boom')) || {};
    expect(description).toBe('Boom');
  });

  it('returns strings as-is', () => {
    const { description } = getErrorDescription('Something went wrong') || {};
    expect(description).toBe('Something went wrong');
  });

  it('returns undefined for empty input', () => {
    const { description } = getErrorDescription(undefined) || {};
    expect(description).toBeUndefined();
  });

  it('stringifies non-error values', () => {
    const { description } = getErrorDescription(123) || {};
    expect(description).toBe('123');
  });
});
