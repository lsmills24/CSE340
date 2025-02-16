const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
    const nav = await utilities.getNav()
    req.flash("notice", "This is a flash message.") // "notice" is a class that can be styled in CSS, and the second param is a strong to be displayed
    res.render("index", {title: "Home", nav})
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
baseController.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = baseController