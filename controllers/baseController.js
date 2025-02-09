const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
baseController.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = baseController