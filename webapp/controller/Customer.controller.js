sap.ui.define([
	"at/clouddna/training/FioriDeepDive/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (BaseController, JSONModel, MessageBox, History) {
	"use strict";

	return BaseController.extend("at.clouddna.training.FioriDeepDive.controller.Customer", {

		_formFragments: {},
		_sMode: "",

		onInit: function () {
			this.getRouter().getRoute("Customer").attachPatternMatched(this._onPatternMatched, this);
		},

		_onPatternMatched: function (oEvent) {
			let sCustomerID = oEvent.getParameter("arguments").customerid,
				editModel = new JSONModel({
					editmode: false
				});
			this.setModel(editModel, "editModel");
			this._sMode = "display";

			if (sCustomerID !== "create") {
				this._showFormFragment("DisplayCustomer");
				this.getView().bindElement("/CustomerSet(guid'" + sCustomerID + "')");

				this.getModel().read("/CustomerSet(guid'" + sCustomerID + "')", {
					urlParameters: {
						"$expand": "Documents"
					},
					success: function (oData, response) {
						let oImageModel;

						if (oData.Firstname === "Martin" && oData.Lastname === "Koch") {
							oImageModel = new JSONModel({
								image: oData.Documents.results[5]
							});
						} else {
							oImageModel = new JSONModel({
								image: null
							});
						}
						this.getView().setModel(oImageModel, "imageModel");
					}.bind(this)
				});
			} else {
				let oCreateModel = new JSONModel({
					Firstname: "",
					Lastname: "",
					AcademicTitle: "",
					Gender: "M",
					Email: "",
					Phone: "",
					Website: ""
				});
				this._sMode = "create";
				this.getModel("editModel").setProperty("/editmode", true);
				this._showFormFragment("CreateCustomer");
				this.setModel(oCreateModel, "createModel");
			}
		},

		_toggleButtonsAndView: function (bEdit) {
			let editModel = this.getModel("editModel"),
				bMode = !editModel.getProperty("/editmode");

			editModel.setProperty("/editmode", bMode);

			this._showFormFragment(bMode ? "EditCustomer" : "DisplayCustomer");
		},

		_showFormFragment: function (sName) {
			var oPage = this.byId("customer_page");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sName));
		},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "at.clouddna.training.FioriDeepDive.view." + sFragmentName);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		onEditPress: function (oEvent) {
			this._toggleButtonsAndView();
		},

		onCancelPress: function (oEvent) {
			if (this._sMode === "create") {
				this.onNavBack();
			} else {
				if (this.getModel().hasPendingChanges()) {
					this.getModel().resetChanges();
				}
				this._toggleButtonsAndView();
			}
		},

		onSavePress: function (oEvent) {
			let sMessage;

			if (this._sMode === "create") {
				let oCreateData = this.getModel("createModel").getData(),
					oModel = this.getModel();

				oModel.create("/CustomerSet", oCreateData, {
					success: function (oData, response) {
						MessageBox.information(this.geti18nText("dialog.create.success"), {
							onClose: function (sAction) {
								this.onNavBack();
							}.bind(this)
						});
					}.bind(this),
					error: function (oError) {
						MessageBox.error(oError.message);
					}
				});
			} else {
				if (this.getModel().hasPendingChanges()) {
					this.getModel().submitChanges();
					MessageBox.information(this.geti18nText("dialog.update.success"));
				}
				this._toggleButtonsAndView();
			}
		},

		onExit: function () {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName) || this._formFragments[sPropertyName] === null) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		}

	});

});