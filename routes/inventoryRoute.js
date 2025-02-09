// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to get the vehicle details by vehicleId
router.get("/detail/:vehicleId", invController.buildByVehicleId); 
// To trigger intentional 500 error
router.get("/cause-error", invController.triggerError)

module.exports = router;