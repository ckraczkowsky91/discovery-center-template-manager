sap.ui.define([
   "sap/ui/core/UIComponent"
], function (UIComponent) {
   "use strict";
   return UIComponent.extend("templatemanager.Component", {
      metadata : {
            manifest: "json"
      },
      init : function () {
         // call the init function of the parent
         UIComponent.prototype.init.apply(this, arguments);
         // initialize the router automatically using the configurations in the manifest.json descriptor
         // create the views based on the url/hash
       //Why did I get an error when running the application with the Component.js and the manifest.json files in different folders?
         // this.getRouter() will return a Router control
         // The Router control has a .initialize method that attaches the router to a Hash Changer
         // A Hash Changer control is responsible for maniplating or receiving changes of the browser hash
         // This initialization requires the manifest.json file because the manifest file contains the declaration and configuration of the Router for the Component
         // In addition, the Component calls the manifest in its metadata and therefore the application can not 
		this.getRouter().initialize();
		}
   });
});