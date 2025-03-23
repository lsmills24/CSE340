// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
// Route to get login screen
router.get("/login", utilities.handleErrors(accountController.buildLogin)); 
// Route to Process the login attempt
router.post("/login", 
  regValidate.loginRules(),
  regValidate.checkLoginData, 
  utilities.handleErrors(accountController.accountLogin)
)
// Route to build registration
router.get("/register", utilities.handleErrors(accountController.buildRegister)); 
// Route to post a new registration & process account validation data
router.post(
  "/register", 
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
// Route to build account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAcctManagement));
// Route to logout of account
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

// Route to build account update view
router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildAcctUpdate))
// Route to post update account info
router.post(
  "/update-acct",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)
// Route to post update account password
router.post(
  "/update-pass",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword) 
)

module.exports = router;