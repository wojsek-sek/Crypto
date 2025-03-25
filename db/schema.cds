namespace cryptoCurrencyNamespace;
using { cuid, Currency } from '@sap/cds/common';

//@assert.unique: { name: [name] }
entity CryptoCurrencies : cuid {
  name: String(100) @mandatory;
  symbol: String(10);
  price: Decimal(10,2);
  Currency: Currency;
  timestamp: DateTime;
  change: Decimal(10,2);
  changeValue: Decimal(10,2);
}