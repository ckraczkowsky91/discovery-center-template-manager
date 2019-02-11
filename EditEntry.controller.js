sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
	"use strict";
	return Controller.extend("templatemanager.controller.EditEntry", {
	
	//On initialization of the Controller,
	//We first create a reference to the Router instance initialized in the Component
	//We then use the .getRoute method of the Router control to retrieve a Route control, the method expects a the name of the route as a parameter which we defined in the manifest.json
	//We then use the .attachPatternMatched of the Route control 
	//The method expects a function as a parameter which will be called once the attachPattern event is fired which occure when the URL hash matches the pattern of the route defined in the manifest.json
	//When the attachPattern event is fired, the View will be bound to the current path e.g. ApplicationTypeTemplates(73)
	//We can't do this on initialization of the controller because then the View would be bound to the same entity for the duration of the application, we therefore must bind it once the View has been called
	//We are getting the context binding from the Detail view/controller from which we are navigating
		onInit: function () {
			console.log(this);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("edit").attachPatternMatched(this._onObjectMatched, this);
			
			// Create a new model to hold a reference to the boolean value whether the user can edit this particular
	      	var oViewModel = new JSONModel({
	      		isEditable : true,
	      		isEnabled: false
	      	});
	      	this.getView().setModel(oViewModel, "editModel");
	      	
	      	var oSaveButton = this.getView().byId("save-button");
	      	oSaveButton.setEnabled(false);
		},

	//First, we retrieve the EditEntry view from Controller control, this will return a View object
	//Then, we use the .bindElement method that our View control has inherited from the Element class, we pass the method the name of the binding path and the name of the model
	//For the name of the binding path, we first retrieve the event that initialized the Controller control
	//This event has a .getParameter method, this method expects a string containing the name of the parameter we are looking for and will return the value of that parameter
	//In our case, the arguments parameter is an object so we access the specific value we were looking for which was the entryPath that we defined when we navigated from the Detail page to this EditEntry page
	//By the end of this, the EditEntry view will be bound to the entity that we are referencing from the model, in this case that entity is ApplicationTypeTemplates({ID})
	//This will make the binding context for the whole View "/ApplicationTypeTemplates({ID})"
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").entryPath,
				model: "odata"
			});
			
			var param = oEvent.getParameter("arguments");
			console.log("These are the parameters :" + param.entryPath);
			this._checkPhase();
		},
		
		onNavBack: function(oEvent) {
			console.log(oEvent);
			var oViewModel = this.getView().getModel("editModel");
			oViewModel.setData({
				isEditable : true
			});
		//The goal of this function is to navigate the user back to the detail page
		//First, I need to know where the user came from
		//I can get this information using a History control from the sap/ui/core/routing library
		//The oHistory variable below will hold a reference to instantiation of a History control
			var oHistory = History.getInstance();
		//Second, I will need a variable that will hold the most recent hash
		//This hash represents the last page that the user was on
		//We can access this hash via a method provided by the History control which returns a string containing the previous hash in the user's history
			var sPreviousHash = oHistory.previousHash;
		//The previousHash method will return undefined if there has been no recorded navigation yet
		//In this case, we will send the user back to the last page that the browser has recorded for the user
			if (sPreviousHash !== undefined){
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("manage", {}, true);
			}
			
			var sPath = this.getView().getBindingContext("odata").sPath;
			var initialPhaseValue = this.getView().getModel("odata").getProperty(sPath + "/Phase");
			var userPhaseValue = this.byId("updatePhase").getValue();
			if (userPhaseValue !== initialPhaseValue){
				this.byId("updatePhase").applySettings({"value" : initialPhaseValue});
			}
			
			var initialPercentValue = this.getView().getModel("odata").getProperty(sPath + "/PercentComplete");
			var userPercentValue = this.byId("updatePercent").getValue();
			if (userPercentValue !== initialPercentValue){
				this.byId("updatePercent").applySettings({"value" : initialPercentValue});
			}
		},
		
		Save: function (oEvent) {
			var oModel = this.getView().getModel("odata");

			var oSelectedItem = oEvent.getSource();
			var oContext=oSelectedItem.getBindingContext("odata");
			var sPath = oContext.getPath();
			console.log(sPath);
			
			var sPhaseValue = this.getView().byId("updatePhase").getValue();
/*			var iPointValue = (this.getView().byId("updatePoints").getValue() * 1);*/
			var iPercentValue = (this.getView().byId("updatePercent").getValue() * 1);
			var oEntry = {};
			oEntry.Phase = sPhaseValue;
/*			oEntry.Points = iPointValue;*/
			oEntry.PercentComplete = iPercentValue;

			oModel.update(sPath, oEntry, {
				merge: true, /* if set to true: PATCH/MERGE */
				success: function() {
					var oHistory = History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash;
			
					if (sPreviousHash !== undefined){
					window.history.go(-1);
					} else {
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						oRouter.navTo("overview", {}, true);
					}
					
					/*me.byId("updatePhase").resetProperty("value");*/
				}
			});
			
			//Disable the Save button
			
			oSelectedItem.getModel("editModel").setProperty("/isEnabled", false);
			
/*			var bindingContext = this.getView().getBindingContext("odata").sPath;
			var newPath = bindingContext.replace("/", "");
			console.log(bindingContext);
			console.log(newPath);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				typePath : newPath
			});*/
		},
		
		removeEntry: function (oEvent) {
			console.log("removeEntry button click logged.");
			
			//First, we will need to get a reference to our data model
			//The Controller control provides a .getView method that will return the View connected to that Controller
			//The View control has a .getModel method that it inherits from the ManageObject parent control
			//The .getModel method has an optional parameter that you can pass to it that is a string that contains the name of the model
			//We will need to pass this string because we have named our model "odata" in the models section of our manifest.json file
			var oModel = this.getView().getModel("odata");
			
			//Second, we will need to create a reference to the path to the entry
			//To do this, we can use the event that is triggered when the Button control in the view is pressed
			//The press event has a .getSource method that will return a reference to the Button control that was clicked
			var oSelectedItem = oEvent.getSource();
			//The oSelectedItem object includes a map of binding contexts for the specific instance of the Button control
			//The Button control inherits the .getBindingContext from the ManagedObject parent class which accepts a string containing the name of the model set on this Button
			//Since there is no default model set on the Component of this application, we must define the model as our "odata" model named in the manifest.json
			var oContext = oSelectedItem.getBindingContext("odata");
			//The .getBindingContext will return an object that contains the entire data model as well as the path
			//Using this oContext object, we can create a reference to the path contained in the binding context using the .getPath method of the Context control
			var sPath = oContext.getPath();
			console.log(oSelectedItem);
			console.log(oContext);
			console.log(sPath);
			
			//To delete the entry, we will need to delete it from the data model.
			//The ODataModel control provides a .remove method to trigger the necessary DELETE request to the OData service.
			//The .remove method requires a string passed to it that contains the path to the entry to be deleted
			//The .remove method also has an optional parameter where we can pass additional parameters in JSON format, we don't provide this optional parameter because we have the necessary path from the sPath variable
			oModel.remove(sPath, {
				success : function() {
					var oHistory = History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash;
			
					if (sPreviousHash !== undefined){
					window.history.go(-1);
					} else {
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						oRouter.navTo("overview", {}, true);
					}
				}
			});
			
			//Once the entry has been deleted, we now want to route the user back to the Detail view
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var newPath = sPath + "/ApplicationTypeDetails(42)";
			oRouter.navTo("detail", {
      			typePath: newPath
      		});
      		console.log(oSelectedItem.getBindingContext("odata").getPath().substr(1));
		},
		
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
				this.getView().byId("save-button").setProperty("enabled", true);
		// If the value the user provided does not match the constraints of the Input, then an error will be thrown
		// This error will be caught by the catch statement and processed further
			} catch (oException) {
		// If there was an error we reference our sValueState string variable from earlier and change its value to Error which is the type of ValueState that will show a red box around the Input control
				sValueState = "Error";
		// We also reference our bValidationError boolean variable from earlier and change its value to true
				bValidationError = true;
				this.getView().byId("save-button").setProperty("enabled", false);
			}

			oInput.setValueState(sValueState);

			return bValidationError;
		},
		
		// We create an onChange() function to capture the information and context that is triggered when the user makes a change in their entry
		onChange: function(oEvent) {
		// The event we are passing to this function is the change event from the InputBase control which our Input control inherits from
		// The change event has a getSource() method that will return an object of the EventProvider type which contains information about the event
		// We store the information about the event in the oInput variable
			var oInput = oEvent.getSource();
		// We then pass this variable to our private function _validateInput
			this._validateInput(oInput);
		},
		
		_checkPhase : function() {
			var oModel = this.getView().getModel("odata");
			var sPath = this.getView().getBindingContext("odata").sPath;
			console.log(sPath);
			var oPhase = oModel.read(sPath, {
				success: function(oData) {
					oPhase = oData.Phase;
					console.log(oPhase);
					var oViewModel = this.getView().getModel("editModel");
					var oDeleteButton = this.getView().byId("delete-button");
		// oPhase will contains the read data when called here but once it leaves the success callback it loses that reference
					if (oPhase === "completed" || oPhase === "discover") {
						oViewModel.setData({
							isEditable : false
							});
						oDeleteButton.setEnabled(false);
					}
					console.log(oViewModel);
				}.bind(this)
			});
		}
	});
});