// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
// Route to get login screen
router.get("/login", utilities.handleErrors(accountController.buildLogin)); 
// Route to build registration
router.get("/register", utilities.handleErrors(accountController.buildRegister)); 
// Route to post a new registration & process account validation data
router.post(
    "/register", 
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)
// Temp. to Process the login attempt and redirect to page that says "login process"
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
)
// router.post(
//     "/login",
//     regValidate.loginRules(), 
//     regValidate.checkLoginData,
//     (req, res) => {
//       res.status(200).send('login process')
//     }
// )




module.exports = router;