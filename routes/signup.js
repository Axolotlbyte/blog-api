const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config();

const User = require('../models/user');

// Create new user

router.post("/", async (req, res) => {
    const { username, password} = req.body;

    try{
        let user = await User.findOne({ username })
        if(user) {
            return res.status(400).json({errors: [{ msg: "Username is already in use"}] });
        }

        user = new User({
            username,
            password,
        });

        if(req.body.isAdmin){
            user.isAdmin = req.body.isAdmin;
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();

        const payload = {
            user: {
                id: user._id,
            },
        };

        jwt.sign(
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
        res.status(500).send("Server error")
    }
});

module.exports = router