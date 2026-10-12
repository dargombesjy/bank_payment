sap.ui.define(
    [
        "sap/fe/core/PageController",
        "sap/ui/core/Fragment",
        "sap/m/library",
        "sap/m/MessageToast",
        "sap/ui/comp/valuehelpdialog/ValueHelpDialog"
    ],
    function (PageController, Fragment, mLibrary, MessageToast, ValueHelpDialog) {
        'use strict';

        return PageController.extend('zfibankpayment.ext.view.Main', {
            /**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf zfibankpayment.ext.view.Main
             */
            //  onInit: function () {
            //      PageController.prototype.onInit.apply(this, arguments); // needs to be called to properly initialize the page controller
            //  },

            /**
             * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
             * (NOT before the first rendering! onInit() is used for that one!).
             * @memberOf zfibankpayment.ext.view.Main
             */
            //  onBeforeRendering: function() {
            //
            //  },

            /**
             * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
             * This hook is the same one that SAPUI5 controls get after being rendered.
             * @memberOf zfibankpayment.ext.view.Main
             */
            //  onAfterRendering: function() {
            //
            //  },

            /**
             * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
             * @memberOf zfibankpayment.ext.view.Main
             */
            //  onExit: function() {
            //
            //  }

            onPrintPdf: function () {
                const oView = this.getView();
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "zfibankpayment.ext.view.fragment.Popup",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._pDialog.then(function (oDialog) { oDialog.open(); });
            },

            onConfirmPrint: async function () {
                this._pDialog.then(function (oDialog) { oDialog.close(); });
                const oTable = this.getView().byId("Table1");
                const aContexts = oTable.getSelectedContexts();
                if (!aContexts.length) {
                    MessageToast.show("Select a row");
                    return;
                }

                const oView = this.getView();
                const oPopupModel = oView.getModel("popupModel");

                // Convert to YYYY-MM-DD for backend/OData if needed
                var oSelectedDate = oPopupModel.getProperty("/erdat");
                var sIsoDate = oSelectedDate.toISOString().split("T")[0];

                // console.log("JavaScript Date Object:", oSelectedDate);
                // console.log("Formatted ISO String:", sIsoDate);

                // // "this" is the extension API in custom actions; in a controller extension use this.base.getExtensionAPI()
                // const oExtensionAPI = this.base.getExtensionAPI();
                // const oEditFlow = this.base.getExtensionAPI().getEditFlow(); // or this.base.editFlow
                const oModel = this.getExtensionAPI().getModel();
                const sCount = aContexts.length;

                try {
                    const aResults = await this.editFlow.invokeAction("com.sap.gateway.srvd.zsgi_fi_bank_payment.v0001.printPdf", {
                        contexts: aContexts,
                        // model: aContexts[0].getModel(),
                        model: oModel,
                        parameterValues: [
                            { name: "Erdat", value: sIsoDate },  //oPopupModel.getProperty("/erdat") },
                            { name: "HouseBank", value: oPopupModel.getProperty("/houseBank") },
                            { name: "HouseBankAccount", value: oPopupModel.getProperty("/houseBankAccount") },
                            { name: "Zcount", value: sCount }
                        ],
                        skipParameterDialog: true
                        // invocationGrouping: false
                    });

                    // aResult is an array of results (one per context)
                    // console.log(aResults);
                    const oFirst = Array.isArray(aResults) ? aResults[0] : aResults;
                    const oContext = oFirst && oFirst.value ? oFirst.value : oFirst;

                    if (oContext && oContext.getObject) {
                        // Data already loaded
                        const oData = oContext.getObject();
                        var sUrl = "/sap/opu/odata4/sap/zsgi_sb_fi_f_bank_payment/srvd_a2x/sap/zsgi_sd_fi_f_bank_payment/0001";
                        sUrl += "/ZSGI_FI_F_BANK_PAYMENT(CompanyCode='" + oData.CompanyCode + "',AccountingDocument='";
                        sUrl += oData.AccountingDocument + "',FiscalYear='" + oData.FiscalYear + "')/Form"
                        const URLHelper = mLibrary.URLHelper;
                        if (sUrl) {
                            URLHelper.redirect(sUrl, true);
                        } else {
                            MessageToast.show("Print failed");
                        }

                        // const oReturned = await oContext.requestObject();
                    }

                    oPopupModel.setData({
                        erdat: "",
                        houseBank: "",
                        houseBankAccount: "",
                        zcount: ""
                    });

                } catch (oError) {
                    // Action failed or the parameter dialog was cancelled
                    MessageToast.show("Print failed: " + oError.message);
                    console.error(oError);
                }
            },

            onCancelPrint: function () {
                this._pDialog.then(function (oDialog) { oDialog.close(); });
            },

            onDateChange: function (oEvent) {
                var bValid = oEvent.getParameter("valid");
                var oDatePicker = oEvent.getSource();

                if (!bValid) {
                    oDatePicker.setValueState("Error");
                    oDatePicker.setValueStateText("Please enter a valid date.");
                } else {
                    oDatePicker.setValueState("None");
                }
            },

        });
    }
);
