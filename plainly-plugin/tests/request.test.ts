const mockInstance = {
  get: jest.fn(),
  post: jest.fn(),
};

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    __esModule: true,
    default: {
      ...actual,
      create: jest.fn(() => mockInstance),
      isAxiosError: jest.fn(),
    },
    isAxiosError: jest.fn(),
  };
});

import axios from 'axios';
import FormData from 'form-data';

import { get, mapAxiosError, post, postFormData } from '../src/node/request';

describe('mapAxiosError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const isAxiosErrorMock = jest.mocked(axios.isAxiosError);

  it.each([
    [
      'appends validation codes from errors[].codes[0]',
      {
        response: {
          status: 400,
          data: {
            message:
              "Validation failed for object='projectRenderDto'. Error count: 2",
            errors: [
              { codes: ['NotNull.projectRenderDto.projectId'] },
              { codes: ['NotBlank.projectRenderDto.projectId'] },
            ],
          },
        },
      },
      "Validation failed for object='projectRenderDto'. Error count: 2 (NotNull.projectRenderDto.projectId, NotBlank.projectRenderDto.projectId)",
    ],
    [
      'uses data.message without codes when validation codes are missing',
      {
        response: {
          status: 422,
          data: {
            message: 'Validation failed.',
            errors: [{ codes: [] }, {}],
          },
        },
      },
      'Validation failed.',
    ],
    [
      'uses string response data as the message',
      {
        response: {
          status: 500,
          data: 'Internal error',
        },
      },
      'Internal error',
    ],
    [
      'falls back to default message when string data is empty',
      {
        response: {
          status: 500,
          data: '   ',
        },
      },
      'Request failed with status code 500',
    ],
    [
      'falls back to default message when object data lacks message and error',
      {
        response: {
          status: 400,
          data: {},
        },
      },
      'Request failed with status code 400',
    ],
    [
      'uses default message when errors exist but message and error are missing',
      {
        response: {
          status: 400,
          data: {
            errors: [{ codes: ['NotNull.projectRenderDto.projectId'] }],
          },
        },
      },
      'Request failed with status code 400 (NotNull.projectRenderDto.projectId)',
    ],
    [
      'uses error field when message is missing',
      {
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
      },
      'Not found',
    ],
    [
      'uses default message when axios error has no response',
      {},
      'Request failed with status code unknown',
    ],
  ])('%s', (_label, error, expectedMessage) => {
    isAxiosErrorMock.mockReturnValue(true);

    const mapped = mapAxiosError(error);

    expect(mapped).toBeInstanceOf(Error);
    expect(mapped.message).toBe(expectedMessage);
  });

  it('passes through non-axios errors', () => {
    isAxiosErrorMock.mockReturnValue(false);

    const error = new Error('Boom');
    const mapped = mapAxiosError(error);

    expect(mapped).toBe(error);
  });

  it('wraps non-axios non-Error values', () => {
    isAxiosErrorMock.mockReturnValue(false);

    const mapped = mapAxiosError('boom');

    expect(mapped).toBeInstanceOf(Error);
    expect(mapped.message).toBe('boom');
  });
});

describe('request helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [
      'get',
      () => get('/path', 'api-key'),
      mockInstance.get,
      ['/path', { auth: { username: 'api-key', password: '' } }],
    ],
    [
      'post',
      () => post('/path', 'api-key', '{"a":1}'),
      mockInstance.post,
      ['/path', '{"a":1}', { auth: { username: 'api-key', password: '' } }],
    ],
  ])('%s passes auth and returns response', async (_label, call, mockFn, args) => {
    mockFn.mockResolvedValue({ data: { ok: true } });

    const response = await call();

    expect(mockFn).toHaveBeenCalledWith(...args);
    expect(response).toEqual({ data: { ok: true } });
  });

  it('postFormData passes headers and auth and returns response', async () => {
    mockInstance.post.mockResolvedValue({ data: { ok: true } });

    const body = new FormData();

    const response = await postFormData('/path', 'api-key', body);

    expect(mockInstance.post).toHaveBeenCalledWith('/path', body, {
      headers: { ...body.getHeaders() },
      auth: { username: 'api-key', password: '' },
    });
    expect(response).toEqual({ data: { ok: true } });
  });

  it.each([
    ['get', () => get('/path', 'api-key'), mockInstance.get],
    ['post', () => post('/path', 'api-key', '{}'), mockInstance.post],
  ])('%s throws mapped errors', async (_label, call, mockFn) => {
    jest.mocked(axios.isAxiosError).mockReturnValue(false);
    const thrown = new Error('nope');
    mockFn.mockRejectedValue(thrown);

    await expect(call()).rejects.toBe(thrown);
  });

  it('postFormData throws mapped errors', async () => {
    jest.mocked(axios.isAxiosError).mockReturnValue(false);
    const thrown = new Error('nope');
    mockInstance.post.mockRejectedValue(thrown);

    const body = new FormData();

    await expect(postFormData('/path', 'api-key', body)).rejects.toBe(thrown);
  });
});
