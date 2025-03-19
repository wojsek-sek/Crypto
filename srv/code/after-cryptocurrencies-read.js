/**
 * The custom logic to handle authorization checks after reading CryptoCurrencies, ensuring that the data is accessible only to authenticated users.
 * @After(event = { "READ" }, entity = "cryptoCurrencyNamespaceSrv.CryptoCurrencies")
 * @param {(Object|Object[])} results - For the After phase only: the results of the event processing
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(results, request) {
    // Check if the user is authenticated
    if (!request.user || !request.user.id) {
        // If the user is not authenticated, clear the results
        if (Array.isArray(results)) {
            results.length = 0; // Clear the array
        } else {
            results = null; // Clear the object
        }
    }
};
