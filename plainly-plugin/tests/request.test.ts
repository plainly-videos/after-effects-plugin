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
  beforeEach(() => jest.clearAllMocks());

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
      "400: Validation failed for object='projectRenderDto'. Error count: 2 (NotNull.projectRenderDto.projectId, NotBlank.projectRenderDto.projectId)",
    ],
    [
      'uses default message if there is no response data',
      {
        response: {
          status: 500,
          data: undefined,
        },
      },
      'Request failed with status code 500',
    ],
    [
      'uses error field if message is missing',
      {
        response: {
          status: 403,
          data: {
            error: 'Forbidden access',
          },
        },
      },
      '403: Forbidden access',
    ],
    [
      'handles missing validation codes',
      {
        response: {
          status: 422,
          data: {
            message: 'Unprocessable entity',
            errors: [{}, { codes: [] }],
          },
        },
      },
      '422: Unprocessable entity',
    ],
    [
      'handles missing response status',
      {
        response: {
          data: {
            message: 'Unknown error occurred',
          },
        },
      },
      'Unknown error occurred',
    ],
    [
      'response data is a string',
      {
        response: {
          status: 502,
          data: 'Bad Gateway',
        },
      },
      '502: Bad Gateway',
    ],
    [
      'response data is an unexpected structure',
      {
        response: {
          status: 520,
          data: { unexpected: 'structure' },
        },
      },
      'Request failed with status code 520',
    ],
    [
      'handles missing response object',
      {},
      'Request failed with status code unknown',
    ],
    [
      'falls back to default message if parsing throws',
      {
        response: {
          status: 500,
          data: { message: 'Boom', errors: 'not-an-array' },
        },
      },
      'Request failed with status code 500',
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
