// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
// Route to get login screen
router.get("/login", accountController.buildLogin); 


module.exports = router;