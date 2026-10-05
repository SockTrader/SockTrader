import { FXMacroDataClient } from './fxmacrodata';

describe('FXMacroDataClient', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  const respond = (body: string, status = 200) =>
    fetchMock.mockResolvedValue(new Response(body, { status }));

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should not follow redirects that would carry the api key', async () => {
    respond('{"data": []}');

    await new FXMacroDataClient('test-key').calendar('USD');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toEqual({ 'X-API-Key': 'test-key' });
    expect(init.redirect).toEqual('error');
  });

  it('should not echo an invalid api key in the error', () => {
    expect(() => new FXMacroDataClient('test-key\r\nX-Other: 1')).toThrow(
      'FXMacroData API key contains invalid characters'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should reject an error body returned with HTTP 200', async () => {
    respond('{"detail": "Not found"}');

    await expect(new FXMacroDataClient().calendar('USD')).rejects.toThrow(
      'FXMacroData request failed: Not found'
    );
  });

  it('should reject a non-JSON body', async () => {
    respond('not-json');

    await expect(new FXMacroDataClient().calendar('USD')).rejects.toThrow(
      'FXMacroData returned a non-JSON response'
    );
  });
});
