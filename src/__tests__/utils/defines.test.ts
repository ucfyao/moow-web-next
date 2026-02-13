import { describe, it, expect } from 'vitest';
import { fetchExchangeSymbolList } from '@/utils/defines';

describe('fetchExchangeSymbolList', () => {
  it('returns base symbol list when no exchange specified', () => {
    const list = fetchExchangeSymbolList('');
    expect(list).toHaveLength(5);
    expect(list.map(s => s.quote)).toEqual(['BTC', 'ETH', 'EOS', 'LTC', 'ETC']);
  });

  it('returns base + binance symbols for binance exchange', () => {
    const list = fetchExchangeSymbolList('binance');
    expect(list.length).toBeGreaterThan(5);
    expect(list.some(s => s.symbol === 'BCC/USDT')).toBe(true);
  });

  it('returns base + huobipro symbols for huobipro exchange', () => {
    const list = fetchExchangeSymbolList('huobipro');
    expect(list.length).toBeGreaterThan(5);
    expect(list.some(s => s.symbol === 'CMT/USDT')).toBe(true);
    expect(list.some(s => s.symbol === 'IOST/USDT')).toBe(true);
  });

  it('returns base + BCH for unknown exchanges', () => {
    const list = fetchExchangeSymbolList('okex');
    expect(list.some(s => s.symbol === 'BCH/USDT')).toBe(true);
  });

  it('all symbols have base USDT', () => {
    const list = fetchExchangeSymbolList('binance');
    expect(list.every(s => s.base === 'USDT')).toBe(true);
  });
});
