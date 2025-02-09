/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute)
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: "Oops! Don't know how you got here but umm..."})
})


/* ***********************
* Express Error Handler
* Place after all other middleware
* Global Error Handling
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}" - ${err.message}`)

  // Checks that status is a valid number (defaults to 500 if undefined/invalid)
  let status = (typeof err.status === "number" && err.status >= 400 && err.status < 600) 
    ? err.status 
    : 500 

  let message = status === 404 
    ? err.message 
    : "Oh no! There was a crash. Maybe try a different route?"

  if (status === 500){
    res.status(status).render("errors/error", {
      title: `${status} - Server Error`,
      message,
      nav
    })
  } else{
    res.status(status).render("errors/error", {
      title: `${status} - Page Not Found`,
      message,
      nav
    })
  }
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})