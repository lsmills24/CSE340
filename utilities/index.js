const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            'vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })  
    list += "</ul>"
    return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '<hr />'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildVehicleDetailView = async function(data){
  let detail = ''
  if(data){
    // Enter HTML with calls to the query results from the inventory table in db
    detail += `<h1>${data.inv_year} ${data.inv_make} ${data.inv_model}</h1>`
    detail += `<section class="vehicle-listing">`
    detail += `<img class="vehicle-image" src="${data.inv_image}" alt="Image of ${data.inv_year} ${data.inv_make} ${data.inv_model}">` // Full size img inv_image
    detail += `<div class="vehicle-details">`
    detail += `<h2 class="vehicle-price">Sale Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</h2>` // Price inv_price
    detail += `<p><b>Year:</b> ${data.inv_year}</p>`
    detail += `<p><b>Make:</b> ${data.inv_make}</p>`
    detail += `<p><b>Model:</b> ${data.inv_model}</p>`
    detail += `<p><b>Mileage:</b> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>` // Mileage inv_miles
    detail += `<p><b>Color:</b> ${data.inv_color}</p>` // Color inv_color
    detail += `<p><b>Seller's Description:</b> ${data.inv_description}</p>` // Description inv_description 
    detail += `</div>`
    detail += `</section>`
  } else { 
    detail += '<p class="notice">Sorry, we could not find details for this vehicle.</p>'
  }
  return detail
}


/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value='' disabled' + (classification_id == null ? ' selected' : '') + '>Choose a Classification</option>"
  data.rows.forEach((row) => {
  classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check account type to allow vehicle access with only admin/employee account
 * ************************************ */
Util.checkAccountType = async function (req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Access forbidden. Please log in with an Admin or Employee account to access vehicle management.");
    return res.status(403).render("account/login", {
      title: "Login",
      nav: await Util.getNav(),
      errors: null,
      account_email: "",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const accountType = decoded.account_type;
    if (accountType === "Employee" || accountType === "Admin") {
      next(); // Allows access
    } else {
      req.flash("notice", "Access forbidden. Please use an Admin or Employee account to access vehicle management.");
      return res.status(403).render("account/login", {
        title: "Login",
        nav: await Util.getNav(),
        errors: null,
        account_email: decoded.account_email || "",
      });
    }
  } catch (err) {
    req.flash("notice", "Access forbidden. Please log in with an Admin or Employee account to access vehicle management.");
    return res.status(403).render("account/login", {
      title: "Login",
      nav: await Util.getNav(),
      errors: null,
      account_email: "",
    });
  }
};



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = Util