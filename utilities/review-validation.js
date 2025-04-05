const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const validate = {}


/* ******************************
 * Review data validation rules
 * ***************************** */
validate.reviewRules = () => {
    return [
        body("review_text")
            .trim()
            .notEmpty()
            .withMessage("Review text is required.")
            .isLength({ min: 1 })
            .withMessage("Review text must be at least 1 character long."),
        body("inv_id")
            .isInt({ min: 1 })
            .withMessage("Invalid vehicle ID."),
        body("account_id")
            .isInt({ min: 1 })
            .withMessage("Invalid account ID."),
    ]
}

/* ******************************
 * Check data and return errors or continue to post review to db
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
    const { review_text, inv_id, account_id } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const vehicle = await require("../models/inventory-model").getVehicleByInvId(parseInt(inv_id))
        res.render("./review/add-review", {
            title: `Review ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            inv_id,
            account_id,
            review_text,
            errors,
        })
        return
    }
    next()
}

/* ******************************
 * Update review data validation rules
 * ***************************** */
validate.updateReviewRules = () => {
    return [
        body("review_text")
            .trim()
            .notEmpty()
            .withMessage("Review text is required.")
            .isLength({ min: 1 })
            .withMessage("Review text must be at least 1 character long."),
        body("review_id")
            .isInt({ min: 1 })
            .withMessage("Invalid review ID."),
        body("account_id")
            .isInt({ min: 1 })
            .withMessage("Invalid account ID."),
    ]
}

/* ******************************
 * Check update data and return errors or continue to update review in db
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { review_text, review_id, account_id } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./review/update-review", {
            title: "Edit Review",
            nav,
            review_id,
            review_text,
            errors,
        })
        return
    }
    next()
}


module.exports = validate