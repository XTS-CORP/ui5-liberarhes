sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function(NumberFormat) {
	"use strict";

	return {
		formatMonto: function(value) {
			if (value === null || value === undefined || value === "") {
				return "0.00";
			}
			var fValue = parseFloat(value);
			if (isNaN(fValue)) {
				return value;
			}
			var oNumberFormat = NumberFormat.getFloatInstance({
				minFractionDigits: 2,
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});
			return oNumberFormat.format(fValue);
		}
	};
});
