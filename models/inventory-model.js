const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
}

/* ***************************
 *  Get all inventory details by inv_id
 * ************************** */
async function getVehicleByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows.length ? data.rows[0] : null 
  } catch (error) {
    // console.error("Database error" + error)
    throw new Error("Something went wrong. Please try again later.")
  }
}

/* ***************************
 *  Insert new classification into db
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("Database input error:", error);
    throw new Error("Sorry, we could not add that classification name. Please try again later.")
  }
}

/* ***************************
 *  Insert new inventory into db
 * ************************** */
async function addInventory({ inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id }) {
  const sql = `INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
  return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleByInvId, addClassification, addInventory};