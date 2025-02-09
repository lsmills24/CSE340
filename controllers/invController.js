const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
} 

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
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
invCont.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

invCont.triggerError = utilities.handleErrors(async function (req, res, next) {
  throw new Error("Intentional 500 Server Error")
})

module.exports = invCont 