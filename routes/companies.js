"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require("./expressError");


/**GET /companies
 * Returns list of companies, like {companies: [{code, name}, ...]}
 */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
    FROM companies`);

  return res.json({ companies: results.rows});
});

/**GET /companies/[code]
 * Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response.
 */

router.get("/:code", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`, [req.params.code]);

  if (!results.rows[0]) {
    throw new NotFoundError("Company code could not be found.");
  }

  return res.json({ company: results.rows[0]});
});

/**POST /companies
 * Adds a company.
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */


module.exports = router;