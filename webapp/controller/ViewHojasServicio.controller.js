sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/TextArea",
	"sap/m/MessageToast",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/ui/model/Filter",
	"sap/m/MessageBox"
	
], function(Controller,JSONModel,Dialog, Label,TextArea,MessageToast,Device,Button,Filter,MessageBox) {
	"use strict";

	return Controller.extend("LiberacionHES.controller.ViewHojasServicio", {
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onInit: function() {
			this.getRouter().getRoute("ViewHojasServicio").attachMatched(this._onRouteMatched, this);
			
			var deviceModel = new sap.ui.model.json.JSONModel({
				    isPhone: sap.ui.Device.system.phone
				});
			this.getView().setModel(deviceModel, "device");
			this._onRouteMatched();
		},
		_onRouteMatched : function (oEvent) {
			// create model
			var oModel = new sap.ui.model.odata.ODataModel("/GWaaS/odata/SAP/ZGW_LIBERACION_HES_SRV/", {
				json: true,
				useBatch: false
			});
			this.getView().setModel(oModel,"proveedor");
			//			load data from URL
			var header = this.getView().byId("oh1");
			header.setVisible(false);	
			var boton = this.getView().byId("btnAprobarr");
			boton.setVisible(false);	
			var idProductsTable = this.getView().byId("idProductsTable");
			idProductsTable.setVisible(false);	
			var oBinding = this.getView().byId("ProductList").getBinding("items");
			if (oBinding) {
				var count = oBinding.getLength();
				this.getView().byId("master2").setTitle("Hojas de Servicio (" + count + ")");
			}
			
			
		},
		onSearch : function (oEvt) {
 
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
 
			// update list binding
			var list = this.getView().byId("ProductList");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
			refreshList: function(oEvent) {
			this.getView().byId("ProductList").getBinding("items").refresh(true);
			var count = this.getView().byId("ProductList").getBinding("items").getLength();
			this.getView().byId("master2").setTitle("Hojas de Servicio (" + count + ")");
			},
			onListItemPress: function(oEvent) {
			var wVista = this.getView();
			var header = this.getView().byId("oh1");
			//header.setProperty("/busy", true);
			
			header.setVisible(true);	
			var idProductsTable = this.getView().byId("idProductsTable");
			
			idProductsTable.setVisible(true);	
			idProductsTable.setBusy(true);
			var boton = this.getView().byId("btnAprobarr");
			boton.setVisible(true);
			var oSelectedItem = oEvent.getSource();
			var oContext = oSelectedItem.getBindingContext("proveedor");
			var sPathI = oContext.getProperty("Packno");
			var sPathII = oContext.getProperty("Waers");
			var sPath = oContext.getPath();
			var oProductDetailPanel = this.getView().byId("oh1");
				oProductDetailPanel.bindElement({
				path: sPath,
				model: "proveedor"
			});
			var oModel = new sap.ui.model.odata.ODataModel("/GWaaS/odata/SAP/ZGW_LIBERACION_HES_SRV/", {
				json: true,
				useBatch: false
			});
			 this.getView().byId("objNumber").setUnit(""+sPathII);
			wVista.setModel(oModel, "desc");
			var filter = new sap.ui.model.Filter("Packno", sap.ui.model.FilterOperator.EQ, sPathI);
			var idProductsTable = this.getView().byId("idProductsTable");
			var binding = idProductsTable.getBinding("items");
			binding.filter(filter);
			idProductsTable.setBusy(false);
			// SmartPhone
			if(wVista.getModel("device").oData.isPhone){
				this.byId("SplitAppDemo").to(this.byId("detail"));
			}
			var textImporte = this.getView().byId("textImporte").getText();
			if(textImporte.toString() === ""){
				this.getView().byId("iconTexto").setVisible(false);
			}
			},
			onDialog: function () {
				var oThis = this;
			var dialog = new Dialog({
					title: "Verificación",
				state: "Warning",
				type: "Message",
				content: [
					new Label({ text: "¿Esta seguro que quiere aprobar la hoja?", labelFor: "rejectDialogTextarea"})
					/*
					new TextArea("rejectDialogTextarea", {
						width: "100%",
						placeholder: "Añadir nota (opcional)"
					})
					*/
				],
				beginButton: new Button({
					text: "Sí",
					press: function () {
						oThis.pressAprobar();
						dialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: "No",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
 
			dialog.open();
		},
		txtFechaForm: function(sName){
			
			if(sName!==null){
			return "" + sName.substring(6, 8) + "/" + sName.substring(4, 6) + "/" + sName.substring(0, 4);	
			}
			//
		},
		// SmartPhone
		handleNavButtonPress: function(){
    		var oSplitCont = this.byId("SplitAppDemo");
    		var oMaster = oSplitCont.getMasterPages()[0];
    		oSplitCont.toMaster(oMaster);
		},
		pressAprobar: function(oEvent) {
			var oThis = this;
			var oView = this.getView();
			var Lblni = oView.byId("attribute2").getText();
			var WiId = oView.byId("attribute1").getText();
			var datos = {};
			datos.Lblni =Lblni;
			datos.WiId =WiId;
			var oModel = new sap.ui.model.odata.ODataModel("/GWaaS/odata/SAP/ZGW_LIBERACION_HES_SRV/", {
				json: true,
				useBatch: false
			});
			oModel.create("/TRelSesHSet", datos, {
					method: "POST",
					success: function(data) {
							oThis.getView().byId("ProductList").getBinding("items").refresh(true);
								var count = oThis.getView().byId("ProductList").getBinding("items").getLength();
									oThis.getView().byId("master2").setTitle("Hojas de Servicio (" + count + ")");
									var header = oThis.getView().byId("oh1");
									header.setVisible(false);	
									var boton = oThis.getView().byId("btnAprobarr");
									boton.setVisible(false);	
									var idProductsTable = oThis.getView().byId("idProductsTable");
									idProductsTable.setVisible(false);	
							var dialog = new sap.m.Dialog({
										title: "Aprobado",
										type: "Message",
										state: "Success",
										content: new sap.m.Text({
											text: "Se aprobó la hoja de servicio con exito."
										}),
										beginButton: new sap.m.Button({
											text: "OK",
											type: "Accept",
											press: function() {
												dialog.close();
											}.bind(this)
										}),
										afterClose: function() {
											dialog.destroy();
										}
									});
									dialog.open();
					}.bind(this),
						error: function(data) {
								oThis.getView().byId("ProductList").getBinding("items").refresh(true);
									var count = oThis.getView().byId("ProductList").getBinding("items").getLength();
									oThis.getView().byId("master2").setTitle("Hojas de Servicio (" + count + ")");
									var header = oThis.getView().byId("oh1");
									header.setVisible(false);	
									var boton = oThis.getView().byId("btnAprobarr");
									boton.setVisible(false);	
									var idProductsTable = oThis.getView().byId("idProductsTable");
									idProductsTable.setVisible(false);	
									
									//var oMessage = data.toString();
									//var message = $(data.response.responseText).find("message").first().text();
									//var myJSON = JSON.stringify(data);
									//var oBody = JSON.parse(myJSON.response.body);
									//var oBody = data.response.body;
									 var message;
									 try {
									 var oBody = JSON.parse(data.response.body);
									 //var errorDetails = oBody.error.innererror.errordetails;
									 var errorDetails = oBody.error.message.value;
									  message =JSON.stringify(errorDetails);
									 } catch (err) {
									 	message = "En proceso de liberación. Esperar un momento y volver a refrescar.";
									 }
									 //alert(JSON.stringify(errorDetails));
                    					//aErrorDetails = [],
									// alert(oBody);
									//var omessage = data.response;
									//.find('message').first().text();
									//var omessage1 = omessage.find("message").first().text();
									//var epar = data.getParameters;
									//alert(omessage1 + "//" +epar);
									//alert(myJSON);
								var dialog = new sap.m.Dialog({
										title: "En proceso",
										type: "Message",
										state: "Warning",
										content: new sap.m.Text({
											//text: "En proceso de liberación. Esperar un momento y volver a refrescar."
											text: message
										}),
										beginButton: new sap.m.Button({
											text: "OK",
											type: "Accept",
											press: function() {
												dialog.close();
											}.bind(this)
										}),
										afterClose: function() {
											dialog.destroy();
										}
									});
									dialog.open();
								}.bind(this)
				
			});
		}
	
	});
});