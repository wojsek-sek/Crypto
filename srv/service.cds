using { cryptoCurrencyNamespace } from '../db/schema.cds';

@path: '/service/cryptoCurrencyNamespace'
@requires: 'authenticated-user'
service cryptoCurrencyNamespaceSrv {
  @odata.draft.enabled
  entity CryptoCurrencies as projection on cryptoCurrencyNamespace.CryptoCurrencies;

  action triggerCryptoCurrency();
}