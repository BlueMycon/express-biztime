"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

/**GET /companies
 * Returns list of companies, like {companies: [{code, name}, ...]}
 */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
    FROM companies`
  );

  return res.json({ companies: results.rows });
});

/**GET /companies/[code]
 * Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response.
 */

router.get("/:code", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [req.params.code]
  );

  if (!results.rows[0]) {
    throw new NotFoundError("Company code could not be found.");
  }

  return res.json({ company: results.rows[0] });
});

/**POST /companies
 * Adds a company.
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */

router.post("/", async function (req, res, next) {
  if (!req.body === false) throw new BadRequestError();

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]
  );
  const company = results.rows[0];
  return res.status(201).json({ company });
});

/**PUT /companies/[code]
 * Edit existing company.
 * Should return 404 if company cannot be found.
 * {name, description} => Returns {company: {code, name, description}}
 */

router.put("/:code", async function (req, res, next) {
  if (!req.body === false) throw new BadRequestError();

  const results = await db.query(
    `UPDATE companies
    SET name=$1, description=$2
    WHERE code = $3
    RETURNING code, name, description`,
    [req.body.name, req.body.description, req.params.code]
  );

  if (!results.rows[0]) {
    throw new NotFoundError("Company code could not be found.");
  }

  const company = results.rows[0];
  return res.json({ company });
});

/** DELETE /companies/[code]
 * Returns 404 if company cannot be found
 * Returns {status: "deleted"}
 */

router.delete("/:code", async function (req, res, next) {
  const results = await db.query(
    `DELETE FROM companies WHERE code = $1 RETURNING code`,
    [req.params.code]
  );

  if (!results.rows[0])
    throw new NotFoundError(`No matching company: ${req.params.code}`);

  return res.json({ status: "deleted" });
});

module.exports = router;
