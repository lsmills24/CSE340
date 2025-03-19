// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validate = require("../utilities/inventory-validation")
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to get the vehicle details by vehicleId
router.get("/detail/:vehicleId", invController.buildByVehicleId); 
// To trigger intentional 500 error
router.get("/cause-error", invController.triggerError)
// Route to build inventory management view
router.get("/", invController.buildInvManagement);
// Route to get JavaScript Inventory file
router.get("/getInventory/:classification_id", invController.getInventoryJSON)
// Route to build add-classification view
router.get("/add-classification", invController.buildAddClass);
// Route to post new classificaiton to db
router.post("/add-classification", invController.addClassification);
// Route to build add-inventory view
router.get("/add-inventory", invController.buildAddInventory)
// Route to post a new registration & process account validation data
router.post(
    "/add-inventory", 
    validate.inventoryRules(),
    validate.checkInvData,
    invController.processAddInventory
)
// Route to build the edit inventory view
router.get("/edit/:inv_id", invController.buildEditInventory)
// Route to update existing inventory
router.post("/update/", 
    validate.inventoryRules(),
    validate.checkUpdateData,
    invController.updateInventory
)
// Route to build the delete confirmation view
router.get("/delete/:inv_id", invController.buildDeleteConfirmation)
// Route to process delete from db
router.post("/delete/", invController.deleteInventory)


//***** All error handling for Inventory is done in invController *****//
module.exports = router;