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
const session = require("express-session")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const reviewRoute = require("./routes/reviewRoute")


/* ***********************
 * Middleware
 * ************************/
app.use(cookieParser())
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Middleware to set loggedIn status and check jwt
app.use((req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.loggedIn = true
      res.locals.accountData = decoded // Includes account_id, account_email, and account_type
    } catch (err) {
      res.locals.loggedIn = false
      res.locals.accountData = null
    }
  } else {
    res.locals.loggedIn = false
    res.locals.accountData = null
  }
  next()
})

//Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)


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
// Inventory Route
app.use("/inv", inventoryRoute)
// Account Route
app.use("/account", accountRoute)
// Review Route
app.use("/review", reviewRoute)
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