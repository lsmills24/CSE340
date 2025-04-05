const pool = require("../database/")

/* *****************************
* Insert review into database
* ***************************** */
async function addReview(review_text, inv_id, account_id) {
    try {
        const sql = `INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *`
        const result = await pool.query(sql, [review_text, inv_id, account_id])
        return result.rowCount > 0
    } catch (error) {
        console.error("addReview error:", error)
        return false
    }
}

async function getReviewById(review_id) {
    try {
        const sql = "SELECT * FROM review WHERE review_id = $1"
        const result = await pool.query(sql, [review_id])
        return result.rows[0] || null
    } catch (error) {
        console.error("getReviewById error:", error)
        return null
    }
}

async function getReviewsByAccountId(account_id) {
    try {
        const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year, i.inv_thumbnail FROM review r
                    JOIN inventory i ON r.inv_id = i.inv_id
                    WHERE r.account_id = $1
                    ORDER BY r.review_date DESC`
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        console.error("getReviewsByAccountId error:", error)
        return []
    }
}

async function getReviewsByInvId(inv_id) {
    try {
        const sql = `SELECT r.*, a.account_firstname, a.account_lastname FROM review r
                    JOIN account a ON r.account_id = a.account_id
                    WHERE r.inv_id = $1
                    ORDER BY r.review_date DESC`
        const result = await pool.query(sql, [inv_id])
        return result.rows
    } catch (error) {
        console.error("getReviewsByInvId error: ", error)
        return []
    }
}



module.exports = { addReview, getReviewById, getReviewsByAccountId, getReviewsByInvId } 