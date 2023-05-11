"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

/* GET /invoices
 * Return info on invoices: like {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT id, comp_code
    FROM invoices`
  );

  return res.json({ invoices: results.rows });
});

/* GET /invoices/[id]
 * Returns obj on given invoice.
 *
 * If invoice cannot be found, returns 404.
 *
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

router.get("/:id", async function (req, res, next) {
  const results = await db.query(
    `SELECT id, amt, paid, add_date, paid_date
    FROM invoices
    WHERE id = $1`,
    [req.params.id]
  );

  const invoice = results.rows[0];

  if (!invoice) {
    throw new NotFoundError("Invoice id could not be found.");
  }

  const results2 = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE company.code = $1`,
    [invoice.comp_code]
  );

  const company = results2.rows[0];

  invoice.company = company;
  return res.json({ invoice });
});


/* POST /invoices
 * Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */




/* PUT /invoices/[id]
Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

/* DELETE /invoices/[id]
Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}
*/


// Also, one route from the previous part should be updated:
/* GET /companies/[code]
Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response.

 */