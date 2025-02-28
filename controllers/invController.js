const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}) 

/* ***************************
 *  Build vehicle details by Id number
 * ************************** */
invCont.buildByVehicleId = utilities.handleErrors(async function (req, res, next) {
  const inv_id = req.params.vehicleId 
  const data = await invModel.getVehicleByInvId(inv_id)

  if (!data) {
    return next({ status: 404 })// , message: "Vehicle Not Found" })
  }

  const detail = await utilities.buildVehicleDetailView(data)
  let nav = await utilities.getNav()
  const vehicleMake = data.inv_make
  const vehicleModel = data.inv_model
  const vehicleYear = data.inv_year
  res.render("./inventory/detail", {
    title: vehicleYear + " " + vehicleMake + " " + vehicleModel,
    nav,
    detail,
  })
})

/* ****************************************
*  Build inventory management add view
* *************************************** */
invCont.buildInvManagement = utilities.handleErrors(async function (req, res, next) {
  let nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Manage Inventory",
      nav,
      errors: null,
  })
}) 

/* ****************************************
*  Build add classification form view
* *************************************** */
invCont.buildAddClass = utilities.handleErrors(async function (req, res, next) {
  let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add Vehicle Classification",
      nav,
      errors: null,
  })
}) 

/* ****************************************
*  Process add classification to call function from invModel
* *************************************** */
invCont.addClassification = utilities.handleErrors(async function (req, res) {
    const { classification_name } = req.body
  
    let addResult = await invModel.addClassification(classification_name)
    let nav = await utilities.getNav()
  
    if (addResult) {
      req.flash("notice", `Thank you for adding ${classification_name} vehicles!`)
      let nav = await utilities.getNav()
      res.render("inventory/management", {
        title: "Add Vehicle Classification",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, we could not add that classification.")
      let nav = await utilities.getNav()
      res.status(501).render("inventory/management", {
        title: "Add Vehicle Classification",
        nav,
        errors: null,
      })
    }
})


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
invCont.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

invCont.triggerError = utilities.handleErrors(async function (req, res, next) {
  throw new Error("Intentional 500 Server Error")
})

module.exports = invCont