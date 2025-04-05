// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities") // handleErrors and check if user is logged in
const reviewController = require("../controllers/reviewController") 
const validate = require("../utilities/review-validation") // not created yet


//** Public routes
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

// Route to build update review

// Route to post update review

// Route to build confirm deletion of review

// Route to post delete review


module.exports = router;