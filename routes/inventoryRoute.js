// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const invController = require("../controllers/invController")
const validate = require("../utilities/inventory-validation")

//** Public routes
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
// Route to get the vehicle details by vehicleId
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildByVehicleId))
// To trigger intentional 500 error
router.get("/cause-error", utilities.handleErrors(invController.triggerError))

//** Admin routes and processes
// Route to build inventory management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildInvManagement))
// Route to get JavaScript Inventory file
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))
// Route to build add-classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClass))
// Route to post new classificaiton to db
router.post("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.addClassification))
// Route to build add-inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))
// Route to post a new registration & process account validation data
router.post(
    "/add-inventory", 
    utilities.checkAccountType, 
    validate.inventoryRules(),
    validate.checkInvData,
    utilities.handleErrors(invController.processAddInventory)
)
// Route to build the edit inventory view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory))
// Route to update existing inventory
router.post("/update/", 
    utilities.checkAccountType, 
    validate.inventoryRules(),
    validate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)
// Route to build the delete confirmation view
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteConfirmation))
// Route to process delete from db
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory))


module.exports = router;