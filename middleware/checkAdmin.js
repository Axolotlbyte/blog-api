const e = require("express");

module.exports = function (req, res, next) {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ errors: [{ msg: "403 Forbidden" }] });
  }
};