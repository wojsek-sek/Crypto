sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ts/projectcrypto/test/integration/FirstJourney',
		'ts/projectcrypto/test/integration/pages/CryptoCurrenciesMain'
    ],
    function(JourneyRunner, opaJourney, CryptoCurrenciesMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ts/projectcrypto') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCryptoCurrenciesMain: CryptoCurrenciesMain
                }
            },
            opaJourney.run
        );
    }
);