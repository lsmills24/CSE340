const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const reviewController = {}


/* ****************************************
*  Build new review view
* *************************************** */
reviewController.buildNewReview = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const vehicle = await invModel.getVehicleByInvId(inv_id)
    if (!vehicle) {
        req.flash("notice", "Vehicle not found.")
        return res.redirect("/inv/")
    }

    res.render("./review/add-review", {
        title: `Review ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        inv_id,
        errors: null,
    })
} 
/* ****************************************
*  Process new review & post to db
* *************************************** */
reviewController.processAddReview = async function (req, res, next) {
    const { review_text, inv_id, account_id } = req.body
    const result = await reviewModel.addReview(review_text, parseInt(inv_id), parseInt(account_id))
    if (result) {
        req.flash("notice", "Review added successfully.")
        res.redirect(`/inv/detail/${inv_id}`)
    } else {
        const nav = await utilities.getNav()
        const vehicle = await invModel.getVehicleById(inv_id)
        req.flash("notice", "Failed to add review.")
        res.status(501).render("./review/add-review", {
            title: `Review ${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            inv_id,
            review_text,
            errors: null,
        })
    }
}

/* ****************************************
*  Build update review view
* *************************************** */
/* ****************************************
*  Post update review to db
* *************************************** */


/* ****************************************
*  Build delete review confirmation view
* *************************************** */
/* ****************************************
*  Post delete review to db
* *************************************** */



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
reviewController.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = reviewController