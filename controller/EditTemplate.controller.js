sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
	], function(Controller, MessageToast, History) {
		"use strict";
		return Controller.extend("templatemanager.controller.EditTemplate", {
			
			onInit: function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// This statement will allow us to display the data of the item that we want to see; without it all of the Inputs are blank
				oRouter.getRoute("editTemplate").attachPatternMatched(this._onObjectMatched, this);
				console.log(this);
				var saveButton = this.getView().byId("save-button");
				saveButton.setEnabled(false);
				var typeInput = this.getView().byId("type-input");
				console.log(typeInput);
			},
			
			_onObjectMatched: function (oEvent) {
				console.log(oEvent);
				this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").entryPath,
				model: "odata"
				});
			},
		
			onNavBack: function (oEvent) {
				var oItem = oEvent.getSource();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this.getView());
				oRouter.navTo("detail", {
					typePath: oItem.getBindingContext("odata").getPath().substr(1)
				});
			},
			
			onChange: function (oEvent) {
			// This is the listener for the liveChange event that is triggered when there is a change made in the Input control
			// When this event happens, we want the Save button to be enabled
			// We can do this by assigning a variable that points to the Save button and uses the setEnabled() method that the SaveAction class inherits from its SemanticButton parent class
			// This method will allow us to toggle the value of the setEnabled() method if the user has changed the value of any of the Input controls
				var saveButton = this.getView().byId("save-button");
				saveButton.setEnabled(true);
			},
			
			onChangeComboBox: function(oEvent) {
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
			
			onSave: function (oEvent) {
				console.log("Save button pressed");
			// When the Save button is pressed, we want the values in the Input to replace the values in the model
			// Let's start by creating all of the variables that we will need for this function
			// We will need to assign variables that points to the Input and grab their new values
				var sTypeValue = this.getView().byId("type-input").getValue();
				var sClassificationValue = this.getView().byId("classification-input").getValue();
				var sNameValue = this.getView().byId("name-input").getValue();
				var sBoardValue = this.getView().byId("board-input").getValue();
			// We will need to assign a variable that points to the "odata" model
				var oModel = this.getView().getModel("odata");
			// We will need to assign a variable that will hold the context of the Input control
				var oEventProvider = oEvent.getSource();
				var oContext = oEventProvider.getBindingContext("odata");
				var sPath = oContext.getPath();
			// We will need to create an object that will hold the new values
				var oEntry = {};

	
			// Next we will start using the variables that we defined previously
			// We will need to fill the object that we created to hold the new values
			// The properties that the object access must be named exactly as they are in the OData service, for example "TemplateBoardId" can't be "TemplateBoardID"
				oEntry.Type = sTypeValue;
				oEntry.Classification = sClassificationValue;
				oEntry.Name = sNameValue;
				oEntry.TemplateBoardId = sBoardValue;
			// What we want is to update the entry in the model with the values of the Input
			// Our model is an instance of the ODataModel class which provides an update() method which expects the following parameters: string containing the path to the data to be updated, an object containing the data itself, and a map array of parameters
				oModel.update(sPath, oEntry, {
					merge: true,
					success: function() {
						var sSuccessMessage = "Update successful!";
						MessageToast.show(sSuccessMessage);
					},
					error: function() {
						var sErrorMessage = "Update failed...";
						MessageToast.show(sErrorMessage);
					}
				});
			
			// We want the Save button to be disabled until the user has made a change to the value of one of the Input controls
				var saveButton = this.getView().byId("save-button");
				saveButton.setEnabled(false);
			},
			
			onDelete: function (oEvent) {
				var oModel = this.getView().getModel("odata");
				var oSelectedItem = oEvent.getSource();
				var oContext = oSelectedItem.getBindingContext("odata");
				var sPath = oContext.getPath();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				 
				oModel.remove(sPath, {
					method: "DELETE"
				});
				 
				oRouter.navTo("overview", {}, true);
			}
		});
	});
