const ZERO_DECIMAL_CURRENCIES = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];

export function getStripeCurrencyMultiplier(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.includes(currency) ? 1 : 100;
}
