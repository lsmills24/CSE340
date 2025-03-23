const utilities = require("../utilities/")
const accountController = {}
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
    // uses the query in accountModel to add the account to the db
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}! Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password // deletes temporary held password
      const payload = {
        account_id: accountData.account_id,
        account_email: accountData.account_email,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_type: accountData.account_type // ensures account type is recognized and held
      }
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    req.flash("notice", "Access forbidden. Please try again.")
    return res.status(403). render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

/* ****************************************
 *  Process logout 
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt") // Clear the session cookie
    req.flash("notice", "You have been logged out successfully.")
    res.redirect("/") // returns user to home page (TASK 6)
}


/* ****************************************
 *  Build the account management view
 * ************************************ */
async function buildAcctManagement(req, res, next) {
  let nav = await utilities.getNav()
    res.render("./account/management", {
      title: "Account Management",
      nav,
      errors: null,
  })
} 


/* ****************************************
 *  Build the account management view
 * ************************************ */
async function buildAcctUpdate(req, res, next) {
  let nav = await utilities.getNav()
    res.render("./account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: "",
      account_lastname: "",
      account_email: "",
  })
}

/* ****************************************
 *  Process the update account info by querying the db
 * ************************************ */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  if (result) {
    const updatedData = {
      account_id,
      account_email,
      account_firstname,
      account_lastname,
      account_type: res.locals.accountData.account_type
    };
    const accessToken = jwt.sign(updatedData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
    res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600 * 1000 });
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Account update failed.");
    res.redirect("/account/update");
  }
}

/* ****************************************
 *  Process the update account password by querying the db
 * ************************************ */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10); // Hash the new password
    const result = await accountModel.updatePassword(account_id, hashedPassword);
    if (result) {
      req.flash("notice", "Password updated successfully.");
      res.redirect("/account/");
    } else {
      req.flash("notice", "Password update failed.");
      res.redirect("/account/update");
    }
  } catch (error) {
    // console.error("updatePassword error:", error);
    req.flash("notice", "An error occurred while updating the password.");
    res.redirect("/account/update");
  }
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
accountController.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, accountLogout, buildAcctManagement, buildAcctUpdate, updateAccount, updatePassword }