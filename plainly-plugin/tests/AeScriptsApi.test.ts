// the bridge reaches for the CEP host, which is not there in a test
// (jest.mock is hoisted, so the factory must reach mockEvalScript lazily)
const mockEvalScript = jest.fn();
jest.mock('../src/node/constants', () => ({
  csInterface: {
    evalScript: (...args: unknown[]) => mockEvalScript(...args),
  },
}));
// only the font lookups use it; jest can't resolve the alias or load lodash-es
jest.mock('@src/ui/utils', () => ({ isEmpty: jest.fn() }), { virtual: true });

import { AeScriptsApi } from '../src/node/bridge/AeScriptsApi';

function aeReturns(result: string) {
  mockEvalScript.mockImplementation((_script, callback) => callback(result));
}

describe('evalScriptAsync', () => {
  it('wraps the call so ExtendScript throws come back as errors', async () => {
    aeReturns('/path/project.aep');
    await AeScriptsApi.getProjectPath();

    const script = mockEvalScript.mock.calls[0][0];
    expect(script).toContain('getProjectPath()');
    expect(script).toContain('catch (e)');
  });

  it('resolves an empty string as a valid result', async () => {
    aeReturns('');
    await expect(AeScriptsApi.getProjectPath()).resolves.toBe('');
  });

  it('resolves undefined for scripts that return nothing', async () => {
    aeReturns('undefined');
    await expect(AeScriptsApi.getProjectPath()).resolves.toBeUndefined();
  });

  it('rejects with the AE error message', async () => {
    aeReturns('Error: boom (getProjectPath)');
    await expect(AeScriptsApi.getProjectPath()).rejects.toThrow(
      'Error: boom (getProjectPath)',
    );
  });

  it('does not treat data containing "Error: " as an error', async () => {
    aeReturns('/projects/Error: draft.aep');
    await expect(AeScriptsApi.getProjectPath()).resolves.toBe(
      '/projects/Error: draft.aep',
    );
  });
});
