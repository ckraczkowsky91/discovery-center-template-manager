sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History){
	"use strict";
	return Controller.extend("templatemanager.controller.CreateEntry", {
		
		onInit: function(){
			console.log(this);
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("createEntry").attachPatternMatched(this._onObjectMatched, this);
			var oModel = this.getOwnerComponent().getModel("odata");
			var me = this;
			oModel.callFunction("/GetApplicationPhases", {
				success: function(oData, response){
					me._populateComboBox(oData);
				}
			});
		},
		
		_onObjectMatched: function(oEvent){
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").createPath,
				model: "odata"
			});
		},
		
		onNavBack: function(){
			//Areate a variable to hold a reference to an instance of a History control
			var oHistory = History.getInstance();
			//Use the getPreviousHash method to return a string with that the last hash the user was on
			var sPreviousHash = oHistory.getPreviousHash();
			
			//If a hash exists, then the user will be directed to the last page that they were on
			//otherwise send them to the overview route which displays the App view
			if (sPreviousHash !== undefined){
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}
			
			this.byId("comboBox").resetProperty("value");
			this.byId("entryPercent").resetProperty("value");
		},
		
		createEntry: function(oEvent){
	//We need to declare and initialize the me variable to hold the value of this controller
	//We need the me variable in this function to make it in scope for the success function called by the oModel.create function
	//Without the me variable the controller would be out of scope to the oModel.create function 
			var me = this;
			
			var oModel = this.getView().getModel("odata");
			
			var oSelectedItem = oEvent.getSource();
			console.log(oSelectedItem);
			var oContext=oSelectedItem.getBindingContext("odata");
			console.log(oContext);
			var sPath = oContext.getPath();
			console.log(sPath);
			
			var sPhaseName = this.getView().byId("comboBox").getValue();
/*			var iPointsValue = (this.getView().byId("entryPoints").getValue() * 1);*/
		//We need the variable to be an int, otherwise the model will throw an error that the create request is malformed because it expects an int for the Percent value
		//By default the getValue method of the Input will return a string. We multiply this string by 1 to convert it to an int.
			var iPercentValue = (this.getView().byId("entryPercent").getValue() * 1);
			var iID = oModel.getProperty(sPath + "/Id");
			console.log(iID);
			console.log(typeof(iPercentValue));
		//We need an object to hold the data that we will insert when creating the entry so we create the empty oEntry object
		//In the next four lines, we fill the empty oEntry object with data
			var oEntry = {};
		//We need to set the ApplicationTypeDetails which is the <NavigationProperty> of the ApplicationTypeTemplates <EntitySet>
		// this ApplicationTypeTemplates is the path where we create the new entry so by adding the metadata to the <NavigationProperty> we
			oEntry.ApplicationTypeDetails = {
				__metadata : {
					uri : "ApplicationTypes(" + iID + ")"
				}
			};
		//We need to use the name of the property as specified in the OData service for our dot notation. For example, we can't use "Percent" over "PercentComplete".
			oEntry.Phase = sPhaseName;
/*			oEntry.Points = iPointsValue;*/
			oEntry.PercentComplete = iPercentValue;
			console.log(oEntry);
		//The create method of an ODataModel control expects a string containing the path where the entry should be created
		//and an object containing the data that should be entered
		
		//This method call will create an entry in the ApplicationTypeTemplate
			oModel.create("/ApplicationTypeTemplates", oEntry, {
				success: function(){
   					me.onNavBack();
   				},
   				error: function(){
   					alert("Create failed");
   				}
   				});
   				
/*   			this.getView().byId("comboBox").setValue("");*/
/*   			this.getView().byId("entryPoints").setValue("");
   			this.getView().byId("entryPercent").setValue("");
   			
   			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash;
			
			if (sPreviousHash !== undefined){
				window.history.go(-1);
				} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
				}*/
		},
		
		_populateComboBox: function(oData) {
			var phaseModel = this.getOwnerComponent().getModel("phaseModel");
			phaseModel.setData(oData);
			console.log(phaseModel);
		},
		
		addCompletedPhase: function(oEntry) {
			oEntry.Phase = "completed";
			oEntry.PercentComplete = 100;
		},
	
	/* This is the function that we will use to validate that what the user enters in the Input control meets our expectations */
		_validateInput: function(oInput) {
		// Since the variable that we are passed from the onChange() function is a ManagedObject, we can use its getBinding() method
		// The getBinding() method will return an object of the Binding type which we assign to oBinding
		// The getBinding() method expects a string as a parameter to identify for which property we want the Binding object
		// We provide the method "value" because we want information about the value property within the Input control
			var oBinding = oInput.getBinding("value");
		// We create a variable to hold the type of ValueState that will not show any colored box around the Input control
			var sValueState = "None";
		// We create a variable to hold whether a validation error has occured, we set it to false initially
			var bValidationError = false;


		// Since our oBinding variable is an object of the Binding type
		// One of the subclasses of the Binding type is PropertyBinding, this subclass has a getType() method
		// We can use this getType() method to return the binding type which will be of a Type type
		// The subclass of the Type type is SimpleType, this subclass has a validateValue() method
		// We can use this validateValue() method to determine whether the value that the user provided meets the constraints of the Input
		// The validateValue() method expects an object or a reference to an object containing the value to be validated
		// We pass the value that the user provided to the validateValue() method to determine if an error has occurred
			try {
				oBinding.getType().validateValue(oInput.getValue());
				this.getView().byId("createButton").setProperty("enabled", true);
		// If the value the user provided does not match the constraints of the Input, then an error will be thrown
		// This error will be caught by the catch statement and processed further
			} catch (oException) {
		// If there was an error we reference our sValueState string variable from earlier and change its value to Error which is the type of ValueState that will show a red box around the Input control
				sValueState = "Error";
		// We also reference our bValidationError boolean variable from earlier and change its value to true
				bValidationError = true;
				this.getView().byId("createButton").setProperty("enabled", false);
			}

			oInput.setValueState(sValueState);
			
			console.log(oInput.getValue());

			return bValidationError;
		},
	
	/* This is the event handler if the user changes the text in the Input control */
		onChange: function(oEvent) {
	// The Input control inherits the change event from its parent InputBase control
	// When this event is triggered, it will return an object of type sap.ui.base.Event which we pass to the event handler as oEvent
	// This Event object includes a .getSource() method which returns an object of type sap.ui.base.EventProvider
	// The EventProvider object that we assign to the oInput variable provides a number of methods that we can use to get more information about the event
		var oInput = oEvent.getSource();
	// We will take the EventProvider object containing the information about the event and pass it to the _validateInput function to ensure that the user's entry meets our expectations
		this._validateInput(oInput);
		}
		})
	});