/**
 * The custom logic to handle authorization checks after reading CryptoCurrencies, ensuring that the data is accessible only to authenticated users.
 * @After(event = { "READ" }, entity = "cryptoCurrencyNamespaceSrv.CryptoCurrencies")
 * @param {(Object|Object[])} results - For the After phase only: the results of the event processing
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(results, request) {
    const { CryptoCurrencies } = cds.entities;
    console.log(await SELECT.from(CryptoCurrencies).orderBy("timestamp"))
    return await SELECT.from(CryptoCurrencies).orderBy("timestamp");
    
};
