sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"fibankpayment/test/integration/pages/ZSGI_FI_C_BANK_PAYMENTMain.gen"
], function (JourneyRunner, ZSGI_FI_C_BANK_PAYMENTMainGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('fibankpayment') + '/test/flp.html#app-preview',
        pages: {
			onTheZSGI_FI_C_BANK_PAYMENTMainGenerated: ZSGI_FI_C_BANK_PAYMENTMainGenerated
        },
        async: true
    });

    return runner;
});

