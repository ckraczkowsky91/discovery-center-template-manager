sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/core/routing/History",
   "sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
   "use strict";
   return Controller.extend("templatemanager.controller.CreateTemplate", {
   		
   		oModel: null,
   		
   		onInit: function(){
			/*Explore using listeners for this*/
			console.log(this);
/*			this._oViewModel = new JSONModel({
					enableSave: false,
					delay: 0,
					busy: false,
					viewTitle: ""
				});
			this.getView().setModel(this._oViewModel, "phaseDataModel");*/
   		},
   		
   		onNavBack: function (event) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			this.byId("phase-type").resetProperty("value");
			this.byId("name").resetProperty("value");
			this.byId("master-board-id").resetProperty("value");
			console.log("Got to resetProperty for master-board-id");
			this.byId("app-type").resetProperty("value");
		},
   		
   		createTemplate: function(oEvent) {
   			
   			// var sValueApplicationType = this.getView().byId("app-type").getSelectedItem().getText();
   			
   			var sValueApplicationType = this.getView().byId("app-type").getValue();
   			
   			var sValuePhaseType = this.getView().byId("phase-type").getValue();
   			
   			var sValueName = this.getView().byId("name").getValue();
   			
   			var sValueMasterBoardId = this.getView().byId("master-board-id").getValue();
   			
   			var oModel = this.getOwnerComponent().getModel("odata");
   			console.log(oModel);
   			
   			var oEntry = {};
			oEntry.Classification = sValueApplicationType;
			oEntry.Type = sValuePhaseType;
			oEntry.Name = sValueName;
			oEntry.TemplateBoardId = sValueMasterBoardId;
			console.log(oEntry);
   			
   			/*createEntity and then bind /ApplicationTypes to that, then i wouldn't need the oEntry variable*/
   			/*submitChanges will trigger the POST*/
   			
   			var me = this;
   			oModel.create('/ApplicationTypes', oEntry, {
				success: function(oData, response){
   					me._addDiscoveryPhase(oData);
   					me._addCompletedPhase(oData);
   					me.onNavBack();
   				},
   				error: function(oData, response){
   					alert("Create failed");
   				}
   				})
   			
   			/*//get the ID of the newly created ApplicationType
   			var iID = this.getView().getModel("odata").getProperty("Id");*/
   			
   			// this.getView().byId("phase-type").setValue("");
   			// this.getView().byId("name").setValue("");
   			// this.getView().byId("app-type").setValue("");
   			// this.getView().byId("master-board-id").setValue("");   
   			//Navigate the user back to the overview page after the new Mission Type has been created
   			// this.onNavBack();
/*   			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash;*/
			
/*			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("overview");*/
/*			if (sPreviousHash !== undefined) {
			window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("overview", {}, true);
				}*/
   			},
   		
   		_onChange: function(oEvent) {
			// I need a variable to hold the information about the event like the user's value and the value of the items in the items aggregation, this is of the type EventProvider
   			var oEventProvider = oEvent.getSource();
   			// I need a variable to hold the value of the user's input to compare against the options, this is a string value
   			var oValue = oEventProvider.getValue();
   			// I need a variable to hold the array of Items that the ComboBox includes in its path variable defined in the View
   			var aItems = oEventProvider.getItems();
   			// We create a variable to hold the type of ValueState that will not show any colored box around the Input control
			var sValueState = "None";
			// We create a variable to hold whether a validation error has occured, we set it to false initially
			var bValidationError = false;	
   			
   			// Create a for loop to run through the user's input and validate it against the options from the applicationTypes.json file
   			for (var i = 0; i < aItems.length; i++){
   			// Create a variable to hold the value of the text property in each entry in the array
   				var sText = aItems[i].getText();
   			// Compare the user's value with the value in the array
   			// If the two values are strictly equal then set the Value State of the ComboBox to None which will display the control normally
   				if (oValue === sText){
   					sValueState = "None";
   					oEventProvider.setValueState(sValueState);
   					bValidationError = false;
   					this.getView().byId("save-button").setEnabled(true);
   					break;
   			// If the user's value is blank then set the Value State of the ComboBox to None which will display the control normally
   				} else if (oValue === "") {
   					sValueState = "None";
   					oEventProvider.setValueState(sValueState);
   					bValidationError = false;
   					this.getView().byId("save-button").setEnabled(true);
   					break;
   				} 
   			// If the two values are not strictly equal and the user's value is not blank then set the Value State of the ComboBox to Error which will display the control with a red outline and make the Save button unclickable
   				else { 
					sValueState = "Error";
					bValidationError = true;
					oEventProvider.setValueState(sValueState);
					this.getView().byId("save-button").setEnabled(false);
   				}
   			}
   		},
   			
   		_addDiscoveryPhase: function(oData){
   			var oModel = this.getView().getModel("odata");
   			var oObject = oData;
   			var iID = oObject.Id;
   			console.log(iID);
   			var oEntry = {};
   			oEntry.ApplicationTypeDetails = {
				__metadata : {
					uri : "ApplicationTypes(" + iID + ")"
				}
			};
			var text = this.getView().getModel("i18n").getResourceBundle().getText("discoverTitle");
   			oEntry.Phase = text;
   			oEntry.PercentComplete = 0;
 
   			oModel.create("/ApplicationTypeTemplates", oEntry);
   		},
   		
   		_addCompletedPhase: function(oData) {
   			var oModel = this.getView().getModel("odata");
   			var oObject = oData;
   			var iID = oObject.Id;
   			var oEntry = {};
   			oEntry.ApplicationTypeDetails = {
   	//You need the double underscores "__" before the metadata because that is the name of the property in the constructor of the ApplicationTypeTemplate EntitySet		
   				__metadata : {
   					uri : "ApplicationTypes(" + iID + ")"
   				}
   			};
   			var text = this.getView().getModel("i18n").getResourceBundle().getText("completedTitle");
   			oEntry.Phase = text;
   			oEntry.PercentComplete = 100;
   			
   			oModel.create("/ApplicationTypeTemplates", oEntry);
   		}
	});
});