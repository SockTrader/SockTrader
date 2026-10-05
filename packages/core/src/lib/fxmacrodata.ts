export type FXMacroDataQuery = Record<
  string,
  string | number | boolean | undefined | null
>;

export class FXMacroDataClient {
  private readonly apiKey?: string;

  constructor(
    apiKey?: string,
    private readonly baseUrl = 'https://api.fxmacrodata.com/v1'
  ) {
    const key = apiKey?.trim();
    // Never include the key itself in the message.
    // eslint-disable-next-line no-control-regex
    if (key && /[\s\x00-\x1f\x7f]/.test(key))
      throw new Error('FXMacroData API key contains invalid characters');
    this.apiKey = key || undefined;
  }

  dataCatalogue(currency: string) {
    return this.get(`/data_catalogue/${normalize(currency)}`);
  }

  // History endpoints return 20 rows by default and at most 100 per request,
  // newest first. Pass { limit, offset, start_date, end_date } in `query` and
  // follow `pagination.next_offset` while `pagination.has_more` is true.
  announcements(currency: string, indicator: string, query?: FXMacroDataQuery) {
    return this.get(
      `/announcements/${normalize(currency)}/${indicator}`,
      query
    );
  }

  calendar(currency: string) {
    return this.get(`/calendar/${normalize(currency)}`);
  }

  predictions(currency: string, indicator: string, query?: FXMacroDataQuery) {
    return this.get(`/predictions/${normalize(currency)}/${indicator}`, query);
  }

  forex(base: string, quote: string, query?: FXMacroDataQuery) {
    return this.get(`/forex/${normalize(base)}/${normalize(quote)}`, query);
  }

  cot(currency: string, query?: FXMacroDataQuery) {
    return this.get(`/cot/${normalize(currency)}`, query);
  }

  commoditiesLatest() {
    return this.get('/commodities/latest');
  }

  commodity(indicator: string, query?: FXMacroDataQuery) {
    return this.get(`/commodities/${indicator}`, query);
  }

  curves(currency: string) {
    return this.get(`/curves/${normalize(currency)}`);
  }

  curveProxies(currency: string) {
    return this.get(`/curve_proxies/${normalize(currency)}`);
  }

  forwardCurves(currency: string) {
    return this.get(`/forward_curves/${normalize(currency)}`);
  }

  marketSessions() {
    return this.get('/market_sessions');
  }

  riskSentiment(query?: FXMacroDataQuery) {
    return this.get('/risk_sentiment', query);
  }

  news(currency: string) {
    return this.get(`/news/${normalize(currency)}`);
  }

  pressReleases(currency: string) {
    return this.get(`/press-releases/${normalize(currency)}`);
  }

  async get(path: string, query: FXMacroDataQuery = {}) {
    const headers: Record<string, string> = this.apiKey
      ? { 'X-API-Key': this.apiKey }
      : {};
    // A followed redirect would carry the X-API-Key header to the new host.
    const response = await fetch(this.url(path, query), {
      headers,
      redirect: 'error',
    });
    if (!response.ok)
      throw new Error(`FXMacroData request failed: ${response.status}`);
    const payload = await parseJson(response);
    if (
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      'detail' in payload &&
      !('data' in payload)
    )
      throw new Error(`FXMacroData request failed: ${String(payload.detail)}`);
    return payload;
  }

  url(path: string, query: FXMacroDataQuery = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params.set(key, String(value));
    }
    const suffix = params.toString();
    return `${this.baseUrl.replace(/\/$/, '')}${path}${
      suffix ? `?${suffix}` : ''
    }`;
  }
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    throw new Error('FXMacroData returned a non-JSON response');
  }
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
