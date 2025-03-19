const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator");

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
// invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
//   const classification_id = req.params.classificationId
//   const data = await invModel.getInventoryByClassificationId(classification_id)
//   const grid = await utilities.buildClassificationGrid(data)
//   let nav = await utilities.getNav()
//   const className = data[0].classification_name
//   res.render("./inventory/classification", {
//     title: className + " vehicles",
//     nav,
//     grid,
//     errors: null,
//   })
// }) 
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try { 
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) { // Checks to see if there are any vehicles in the selected classification
      let nav = await utilities.getNav();
      return res.render("./inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: '<p>No vehicles found under this classification yet.</p><br><br><br>', 
        errors: null,
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    console.error(`Error in buildByClassificationId for ID ${classification_id}:`, error);
    next(error); // Passes any errors to middleware
  }
});

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

  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Manage Inventory",
    nav,
    errors: null,
    classificationSelect,
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
        title: "Manage Inventory",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, we could not add that classification.")
      let nav = await utilities.getNav()
      res.status(501).render("inventory/add-classification", {
        title: "Add Vehicle Classification",
        nav,
        errors: null,
      })
    }
})

/* ****************************************
*  Build add inventory form view
* *************************************** */
invCont.buildAddInventory = utilities.handleErrors(async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList();
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
}) 

/* ****************************************
*  Add inventory to db by calling addInventory in inventory-model
* *************************************** */
invCont.addInventory = utilities.handleErrors(async function (req, res) {
  let nav = await utilities.getNav()
  let { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
      
  if (!inv_image || inv_image.trim() === "") { // Sets default image paths if they're left empty
      inv_image = "/images/vehicles/no-image.png";
  }
  if (!inv_thumbnail || inv_thumbnail.trim() === "") {
      inv_thumbnail = "/images/vehicles/no-image-tn.png";
  }
  
  try {
    const result = await invModel.addInventory({
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
    });
    if (result) {
        req.flash("notice", "Vehicle added successfully!");
        res.redirect("/inv/");
    } else {
        throw new Error("Failed to add vehicle to inventory.")
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    const classificationList = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Error adding inventory. Please try again.");
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
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
    })
  }
})

/* ****************************************
*  Process add inventory after validation
* *************************************** */
invCont.processAddInventory = utilities.handleErrors(async function (req, res) {
  const errors = validationResult(req)
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array())
    const classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Failed to add to inventory. Please correct the error(s) below:")
    let nav = await utilities.getNav()
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle to Inventory",
      nav,
      errors,
      classificationList,
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
    })
  }
  await invCont.addInventory(req, res)
})


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = utilities.handleErrors(async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
})


/* ***************************
 *  Build Edit Inventory view 
 * ************************** */
invCont.buildEditInventory = utilities.handleErrors(async function (req, res, next) {
  const invId = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleByInvId(invId)
  const classificationList = await utilities.buildClassificationList(data.classification_id);
  const name = `${data.inv_year} ${data.inv_make} ${data.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + name,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_description: data.inv_description,
    inv_image: data.inv_image, 
    inv_thumbnail: data.inv_thumbnail, 
    inv_price: data.inv_price,
    inv_miles: data.inv_miles,
    inv_color: data.inv_color,
    classification_id: data.classification_id,
  })
}) 


/* ****************************************
*  Update inventory in db by calling editInventory in inventory-model
* *************************************** */
invCont.updateInventory = utilities.handleErrors(async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_year} ${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
})


/* ***************************
 *  Build delete inventory confirmation view 
 * ************************** */
invCont.buildDeleteConfirmation = utilities.handleErrors(async function (req, res, next) {
  const invId = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleByInvId(invId)
  const name = `${data.inv_year} ${data.inv_make} ${data.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    errors: null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_price: data.inv_price,
  })
}) 


/* ****************************************
*  Delete inventory in db by calling deleteInventory in inventory-model
* *************************************** */
invCont.deleteInventory = utilities.handleErrors(async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    // const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_year} ${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
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