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
        const vehicle = await invModel.getVehicleByInvId(inv_id)
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
reviewController.buildUpdateReview = async function (req, res, next) {
    const review_id = parseInt(req.params.review_id)
    let nav = await utilities.getNav()
    const review = await reviewModel.getReviewById(review_id)
    if (!review || review.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don’t have permission to edit it.")
        return res.redirect("/account/")
    }
    res.render("./review/update-review", {
        title: "Edit Review",
        nav,
        review_id,
        review_text: review.review_text,
        errors: null,
    })
}

/* ****************************************
 *  Post update review to db
 * *************************************** */
reviewController.updateReview = async function (req, res, next) {
    const { review_text, review_id, account_id } = req.body
    const result = await reviewModel.updateReview(parseInt(review_id), review_text, res.locals.accountData.account_id)
    if (result) {
        req.flash("notice", "Review updated successfully.")
        res.redirect("/account/")
    } else {
        let nav = await utilities.getNav()
        req.flash("notice", "Failed to update the review.")
        res.status(501).render("./review/update-review", {
            title: "Edit Review",
            nav,
            review_id,
            review_text,
            errors: null,
        })
    }
}

/* ****************************************
 *  Build delete review confirmation view
 * *************************************** */
reviewController.buildDeleteReview = async function (req, res, next) {
    const review_id = parseInt(req.params.review_id)
    let nav = await utilities.getNav()
    const review = await reviewModel.getReviewById(review_id)
    if (!review || review.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don’t have permission to delete it.")
        return res.redirect("/account/")
    }
    const vehicle = await invModel.getVehicleByInvId(review.inv_id)
    res.render("./review/confirm-review-delete", {
        title: "Delete Review",
        nav,
        review_id,
        review_text: review.review_text,
        inv_year: vehicle.inv_year,
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        errors: null,
    })
}

/* ****************************************
 *  Post delete review to db
 * *************************************** */
reviewController.deleteReview = async function (req, res, next) {
    const { review_id } = req.body
    const account_id = res.locals.accountData.account_id
    const result = await reviewModel.deleteReview(parseInt(review_id), account_id)
    if (result) {
        req.flash("notice", "Review deleted successfully.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Failed to delete the review.")
        res.redirect("/account/")
    }
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
reviewController.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = reviewController