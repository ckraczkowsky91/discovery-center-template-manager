sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
   "sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
	"use strict";
	return Controller.extend("templatemanager.controller.Detail", {
		
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
	// Create a new model to hold a reference to the boolean value whether the user can edit this particular
	      	var oViewModel = new JSONModel({
	      		isVisible : true
	      	});
	      	this.getView().setModel(oViewModel, "detailModel");
	      	
	      	console.log(this);
		},
		
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").typePath,
				model: "odata"
			});
		},
		
		editEntry : function (oEvent) {
	      	console.log('editEntry button click logged.');
	      	var oItem = oEvent.getSource();  
	      	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	      	oRouter.navTo("edit", {
      			entryPath: oItem.getBindingContext("odata").getPath().substr(1)
      		});
      },
		
		editTemplate : function(oEvent) {
		// We want this function to route us from the "detail" View to a View where we can edit the Template
		// We will need to get the Component's Router object in order to do this
		// We can get a pointer to the Router from the Component itself; we do this by creating a new variable and assigning it to our Component object and calling that object's getRouterFor() function
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oItem = oEvent.getSource();
			oRouter.navTo("editTemplate", {
				entryPath: oItem.getBindingContext("odata").getPath().substr(1)
			});
		},
		
		onNavBack: function () {
			
			// Create a local variable that holds a reference to a Router object
			// What we want is an instance of the Router that we initialized when we loaded the UIComponent control when our application was first run
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//We use the .navTo method of the Router control to perform the routing
			//The .navTo method expects a name of a route, we have defined this name in the manifest.json descriptor file, the route states that when the pattern "#overview" is matched then the router should navigate to our App view
			oRouter.navTo("overview");
/*			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash;
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}*/
		},
		
		Save: function (oEvent) {
			var oModel = this.getView().getModel("odata");

			var oSelectedItem = oEvent.getSource();
			var oContext=oSelectedItem.getBindingContext("odata");
			var sPath = oContext.getPath();
			console.log(sPath);
			
			var sValue = this.getView().byId("updatePhase").getValue();
			var oEntry = {};
			oEntry.Phase = sValue;
			console.log(sValue);
			console.log(oEntry);
			
 			oModel.update(sPath, oEntry, {
				merge: true /* if set to true: PATCH/MERGE */
			});
		},
		
		goCreateEntry: function(oEvent){
			console.log("goCreateEntry button click logged.");
			//In order to navigate, I first need to get a reference to the router that our Component instantiated when it was loaded
			//We use the getRouterFor function and pass to it this controller which has to be created in the context of a UIComponent to return the router instance
			//The getRouterFor function will return a Router object
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Now that I have a reference to our router, I will use its navTo property to navigate from this page to the page to create an entry
			//navTo expects a string where we pass the route that was defined in the manifest.json descriptor
			var oItem = oEvent.getSource();
			oRouter.navTo("createEntry", {
      			createPath: oItem.getBindingContext("odata").getPath().substr(1)
      		});
		},
		
		Delete: function (oEvent) {
		 var oModel = this.getView().getModel("odata");
		 console.log(oModel);
		 
		 var oSelectedItem = oEvent.getSource();
		 var oContext = oSelectedItem.getBindingContext("odata");
		 var sPath = oContext.getPath();
		 console.log(sPath);
		 
		 oModel.remove(sPath, {
		 	method: "DELETE"
		 });
		 
		var oHistory = History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash;
			
		if (sPreviousHash !== undefined) {
		window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}
		},
		
		_checkPhase : function() {
	//First, get a reference to the OData model that contains the property with the value of the Phase in the ApplicationTypeTemplates EntitySet
			var oModel = this.getView().getModel("odata");
	//Second, traverse the model to get the Phase property
			var phaseProperty = oModel.getProperty("/ApplicationTypeTemplates");
			console.log(phaseProperty);
		}
	});
});