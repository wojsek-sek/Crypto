using { cryptoCurrencyNamespace } from '../db/schema.cds';

@path: '/service/cryptoCurrencyNamespace'
@requires: 'authenticated-user'
service cryptoCurrencyNamespaceSrv {
  @odata.draft.enabled
  entity CryptoCurrencies as projection on cryptoCurrencyNamespace.CryptoCurrencies;

  entity ChartType as projection on cryptoCurrencyNamespace.ChartType;

  entity UserChart as projection on cryptoCurrencyNamespace.UserChart;
  
  @readonly
  entity SortedCrypto as select from CryptoCurrencies
  order by timestamp asc;

  action triggerCryptoCurrency();
}