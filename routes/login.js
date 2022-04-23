const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
require("dotenv").config();

// Sign in / log in
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    let user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Email" }] });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ errors: [{ msg: "Invalid Password" }] });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };
    console.log(process.env.JWT_SECRET);
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
