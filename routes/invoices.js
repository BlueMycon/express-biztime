"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

/**GET /invoices
 * Return info on invoices: like {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT id, comp_code
    FROM invoices`
  );

  return res.json({ invoices: results.rows });
});

/**GET /invoices/[id]
 * Returns obj on given invoice.
 *
 * If invoice cannot be found, returns 404.
 *
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

router.get("/:id", async function (req, res, next) {
  const { rows: [invoice] } = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
    FROM invoices
    WHERE id = $1`,
    [req.params.id]
  );

  if (!invoice) {
    throw new NotFoundError("Invoice id could not be found.");
  }

  const { rows: [company] } = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE companies.code = $1`,
    [invoice.comp_code]
  );

  invoice.company = company;
  delete invoice.comp_code;
  return res.json({ invoice });
});

/**POST /invoices
 * Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res, next) {
  if (!("comp_code" in req.body) || !("amt" in req.body))
    throw new BadRequestError();

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [req.body.comp_code, req.body.amt]
  );
  const invoice = results.rows[0];
  return res.status(201).json({ invoice });
});

/**PUT /invoices/[id]
 * Updates an invoice.
 * If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.put("/:id", async function (req, res, next) {
  if (!("amt" in req.body)) throw new BadRequestError();

  const results = await db.query(
    `UPDATE invoices
    SET amt=$1
    WHERE id = $2
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [req.body.amt, req.params.id]
  );

  if (!results.rows[0]) {
    throw new NotFoundError("Invoice id could not be found.");
  }

  const invoice = results.rows[0];
  return res.json({ invoice });
});

/**DELETE /invoices/[id]
 * Deletes an invoice.
 * If invoice cannot be found, returns a 404.
 * Returns: {status: "deleted"}
 */

router.delete("/:id", async function (req, res, next) {
  const results = await db.query(
    `DELETE FROM invoices WHERE id = $1 RETURNING id`,
    [req.params.id]
  );

  if (!results.rows[0])
    throw new NotFoundError(`No matching invoice: ${req.params.id}`);

  return res.json({ status: "deleted" });
});

module.exports = router;
