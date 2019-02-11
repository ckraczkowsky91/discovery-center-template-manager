sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/Filter",
   "sap/ui/model/FilterOperator",
   "sap/ui/Device"
], function (Controller, Filter, FilterOperator, Device) {
   "use strict";
   return Controller.extend("templatemanager.controller.App", {
      
      onInit : function () {
      	var oModel = this.getView().getModel("applicationTypes");
      	this.getView().setModel(oModel, "applicationTypes");
      	/*this._mViewSettingsDialogs = {};*/
      	var oList = this.byId("templateList");
      	this._oList = oList;
      	this._oListFilterState = {
			aFilter: [],
			aSearch: []
			};
      },
      
      goCreate : function (oEvent) {
      	console.log('goCreate button click logged.');
      	this.getOwnerComponent().getRouter().navTo("create");
/*      	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      	oRouter.navTo("create");*/
      },
      
      seeDetail : function (oEvent) {
      	console.log('seeDetail button click logged.');
      	//This function is to route the user from the main page to the detail page where they can see details on the Mission Type
      	// I needed to get the information from the selected item so that I could display this on the detail page
      	// To do this, I am creating the oItem variable in the view that is routing to the detail page
      	// The oItem variable will hold a reference to the control that has been clicked
		//First, I will need to establish the context for the router
		//The Button control that I am using has a press event built-in, I am passing this press event to my function that will act on that event
		//The press event has a method called getSource which will return a reference to the Button control
		//I will use the oItem variable to contain that reference
      	var oItem = oEvent.getSource();
      	//Second, I need to retrieve the router from the Component where we instantiated it on loading of this application
      	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      	//Third, I need to use the router to navigate from the main page to the detail page
		//What the oRouter variable holds is a reference the Router object for this application
		//The Router object comes with a navTo method that will navigate to the specific route that I named and defined in the manifest.json descriptor file
		//The navTo method takes a string with the name of the route, an object of parameters, and a boolean for browser settings
      	oRouter.navTo("detail", {
      		typePath: oItem.getBindingContext("odata").getPath().substr(1)
      	});
      },
      
      onFilterTemplates : function (oEvent) {
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Type", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.byId("templateList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
		
		/*createViewSettingsDialog : function(sDialogFragmentName) {
			
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this.getView().addDependent(this.oDialog);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			console.log(this);
			return oDialog;
		},*/
		
		handleFilterButtonPressed : function () {
			/*this.createViewSettingsDialog("templatemanager.view.FilterDialog").open();*/
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("templatemanager.view.FilterDialog", this);
				this.getView().addDependent(this.oDialog);
			}
			this.oDialog.open();
		},
		
		handleFilterDialogConfirm: function(oEvent) {
		// I pass the event triggered by the "confirm" property of the ViewSettingsDialog
		// This is of type sap.ui.base.Event which has a method of getParameters() which will return an object
		// The object returned by the .getParameters() method has a property called filterItems which is an array of objects of type ViewSettingsItem
			var aFilterItems = oEvent.getParameters().filterItems,
				aFilters = [],
				aCaptions = [];

			// update filter state using the array's .forEach() method which executes a function for each element in the array
			// combine the filter array and the filter string
			aFilterItems.forEach(function(oItem) {
			// First, we point to the local aFilters variable created earlier
			// Second, we push a new object into that array of type Filter 
			// We consruct the Filter object using its individual constructor arguments including a path, operator, and 1 - 2 values
			// For the path argument, we access the oItem which is the item that we clicked on and is contained within the ViewSettingsFilterItem defined in the view
			// We use the .getParent() method to access the parent ViewSettingsFilterItem and use the .getKey() method to get the key that we defined in the view i.e. "types"
			// We then access the .EQ property of the FilterOperator control to indicate the operator that we want to use
			// We then 
				aFilters.push(new Filter(oItem.getParent().getKey(), FilterOperator.EQ, oItem.getText()));
				aCaptions.push(oItem.getText());
			});

			
			this._oListFilterState.aFilter = aFilters;
			//this._updateFilterBar(aCaptions.join(", "));
			this._applyFilterSearch();
		},
		
		_applyFilterSearch: function() {
			// Create a local variable of type array that combines the aSearch property of the _oListFilterState variable and the global aFilter array variable
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
			// Create a local variable that points to the model with the application type data
				oViewModel = this.getView().getModel("applicationTypes");
			// Get the 
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			// if (aFilters.length !== 0) {
			// 	oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			// } else if (this._oListFilterState.aSearch.length > 0) {
			// 	// only reset the no data text to default when no new search was triggered
			// 	oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			// }
		}
   });
});