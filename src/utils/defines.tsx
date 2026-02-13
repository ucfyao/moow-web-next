// Supported Investment Coins Configuration

const baseSymbolList = [
  { symbol: "BTC/USDT", base: "USDT", quote: "BTC" },
  { symbol: "ETH/USDT", base: "USDT", quote: "ETH" },
  { symbol: "EOS/USDT", base: "USDT", quote: "EOS" },
  { symbol: "LTC/USDT", base: "USDT", quote: "LTC" },
  { symbol: "ETC/USDT", base: "USDT", quote: "ETC" }
];

export const fetchExchangeSymbolList = (exchange: string) => {
  if(!exchange) {
    return baseSymbolList;
  }
  let ownSymbolList = [];
  if(exchange === 'binance') {
    ownSymbolList = [
      { symbol: "BCC/USDT", base: "USDT", quote: "BCC" }
    ];
  } else if(exchange === 'huobipro') {
    ownSymbolList = [
      { symbol: "BCH/USDT", base: "USDT", quote: "BCC" },
      { symbol: "CMT/USDT", base: "USDT", quote: "CMT" },
      { symbol: "IOST/USDT", base: "USDT", quote: "IOST" }
    ];
  }else{
    ownSymbolList = [
      { symbol: "BCH/USDT", base: "USDT", quote: "BCH" }
    ];
  }
  return baseSymbolList.concat(ownSymbolList);
}
