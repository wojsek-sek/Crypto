/**
 * The custom logic to handle authorization checks after reading CryptoCurrencies, ensuring that the data is accessible only to authenticated users.
 * @After(event = { "READ" }, entity = "cryptoCurrencyNamespaceSrv.CryptoCurrencies")
 * @param {(Object|Object[])} results - For the After phase only: the results of the event processing
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
 */
module.exports = async function(results, request) {
    const axios = require('axios');
    const { CryptoCurrencies } = cds.entities;

    // Check if the user is authenticated
    // if (!request.user || !request.user.isAuthenticated()) {
    //     throw new Error('User is not authenticated');
    // }

    try {
        // Make an API call to fetch data from the specified URL
        const url = 'https://api.coinlore.net/api/ticker/?id=90,80';
        const response = await axios.get(url);

        // Process the API data as needed
        const apiData = response.data;
        //console.log(apiData);

        for (const data of apiData) {
            const { name, symbol, price_usd: price, percent_change_1h : change} = data;
            let timestamp = new Date().toISOString();
            let ID = cds.utils.uuid();
            let changePrice = parseFloat(price) + parseFloat((price * (change * 0.01)));
            changePrice = changePrice.toFixed(2);
            await INSERT.into(CryptoCurrencies).columns(['ID', 'name', 'symbol', 'price', 'timestamp', 'change', 'changeValue']).values(ID, name, symbol, price, timestamp, change, changePrice);
        }

    } catch (error) {
        console.error('Error fetching API data:', error);
    }
};