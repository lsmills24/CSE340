const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}


/*  **********************************
  *  Add Inventory Data Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
    return [
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Make is required.") 
        .bail() // Stops if notEmpty fails
        .isLength({ min: 1 })
        .withMessage("Make is required.") 
        .bail() // Stops if length fails
        .isAlphanumeric("en-US", { ignore: " -" })
        .withMessage("Make must contain only letters, numbers, spaces, or hyphens."),

        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Model is required.")
        .bail()
        .isLength({ min: 1 })
        .withMessage("Model is required.")
        .bail()
        .isAlphanumeric("en-US", { ignore: " -" })
        .withMessage("Model must contain only letters, numbers, spaces, or hyphens."),

        body("inv_year")
        .escape()
        .notEmpty()
        .withMessage("Year is required.")
        .bail()
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage(`Year must be a 4-digit number between 1900 and ${new Date().getFullYear() + 1}.`),

        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Description is required.")
        .bail()
        .isLength({ min: 1 })
        .withMessage("Description is required."),

        body("inv_image")
        .trim()
        .escape()
        .optional({ checkFalsy: true })
        .matches(/\.(jpg|jpeg|png|gif)$/)
        .withMessage("Image must be a valid file type (jpg, jpeg, png, gif)."),

        body("inv_thumbnail")
        .trim()
        .escape()
        .optional({ checkFalsy: true })
        .matches(/\.(jpg|jpeg|png|gif)$/)
        .withMessage("Thumbnail must be a valid file type (jpg, jpeg, png, gif)."),

        body("inv_price")
        .escape()
        .notEmpty()
        .withMessage("Price is required.")
        .bail()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number."),

        body("inv_miles")
        .escape()
        .notEmpty()
        .withMessage("Mileage is required.")
        .bail()
        .isInt({ min: 0 })
        .withMessage("Mileage must be a non-negative number."),

        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Color is required.")
        .bail()
        .isLength({ min: 1 })
        .withMessage("Color is required.")
        .bail()
        .isAlpha("en-US", { ignore: " " })
        .withMessage("Color must contain only letters and spaces."),

        body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please select a classification.")
        .bail()
        .isInt({ min: 1 })
        .withMessage("Please select a valid classification."),
    ];
}

/* ******************************
 * Check data and return errors or continue to add inventory
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-inventory", {
      title: "Add Vehicle to Inventory",
      nav,
      classificationList: classificationList,
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png", // Default no-image
      inv_thumbnail: "/images/vehicles/no-image-tn.png", // Default no-thumbnail
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to update inventory
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body
  const name = `${inv_year} ${inv_make} ${inv_model}`
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("./inventory/edit-inventory", {
      title: "Edit " + name,
      nav,
      classificationList: classificationList,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    })
    return
  }
  next()
}


module.exports = validate