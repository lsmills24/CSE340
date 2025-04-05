// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities") // handleErrors and check if user is logged in
const reviewController = require("../controllers/reviewController") 
const validate = require("../utilities/review-validation") // not created yet


// Route to build review creation view
router.get("/add/:inv_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildNewReview))
// Route to post new review
router.post(
    "/add", 
    utilities.checkLogin, 
    validate.reviewRules(), 
    validate.checkReviewData, 
    utilities.handleErrors(reviewController.processAddReview)
)

// Route to build update review view
router.get("/edit/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildUpdateReview))
// Route to post update review
router.post(
    "/edit",
    utilities.checkLogin,
    validate.updateReviewRules(), 
    validate.checkUpdateData,
    utilities.handleErrors(reviewController.updateReview)
)

// Route to build confirm deletion of review
router.get("/delete/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildDeleteReview))
// Route to post delete review
router.post("/delete", utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview))


module.exports = router;