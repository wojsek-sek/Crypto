/**
 * The custom logic to validate authenticated users before creating or updating CryptoCurrencies, ensuring that only authorized users can perform these operations.
 * @Before(event = { "CREATE","UPDATE" }, entity = "cryptoCurrencyNamespaceSrv.CryptoCurrencies")
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
 */
module.exports = async function(request) {
  // Check if the user is authenticated
  if (!request.user || !request.user.is('authenticated-user')) {
    request.reject(403, 'You are not authorized to perform this operation.');
  }

  // Additional validation logic can be added here if needed
}
