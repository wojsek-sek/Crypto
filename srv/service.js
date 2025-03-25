/**
 * Code is auto-generated by Application Logic, DO NOT EDIT.
 * @version(2.0)
 */
const LCAPApplicationService = require('@sap/low-code-event-handler');
const before_Cryptocurrencies_Create_Update = require('./code/before-cryptocurrencies-create-update');
const before_Cryptocurrencies_Read = require('./code/before-cryptocurrencies-read');
const after_Cryptocurrencies_Read = require('./code/after-cryptocurrencies-read');
const api_CoinCall = require('./code/api_CoinCall')

class cryptoCurrencyNamespaceSrv extends LCAPApplicationService {
    async init() {

        this.before(['CREATE', 'UPDATE'], 'CryptoCurrencies', async (request) => {
            await before_Cryptocurrencies_Create_Update(request);
        });

        this.after('READ', 'CryptoCurrencies', async (results, request) => {
            await after_Cryptocurrencies_Read(results, request);
        });

        this.before('READ', 'CryptoCurrencies', async (results, request) => {
            await before_Cryptocurrencies_Read(results, request);
        });

        this.on('triggerCryptoCurrency', async (request) => {
            await api_CoinCall(request);
        });

        return super.init();
    }
}


module.exports = {
    cryptoCurrencyNamespaceSrv
};