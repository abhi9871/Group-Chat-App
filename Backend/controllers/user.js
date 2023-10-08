const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try{
        const { name, email, phone, password } = req.body;

        // Check for password length
        if (password.split(' ').join('').length < 8) {
            return res.status(400).json({success: false, errors: { password: "Password must be atleast 8 characters long" } });
        }

        // Hashing a password
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({
            name: name,
            email: email,
            phone: phone,
            password: hashPassword,
        });
        res.status(200).json({ success: true, message: "Sign up successful." });
        
    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            const validationErrors = {};
            err.errors.forEach((error) => {
                validationErrors[error.path] = error.message;
            });
            res.status(400).json({ success: false, errors: validationErrors });
        } else if (err.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({success: false, errors: { email: "Email already exists" },
        });
        } else {
            console.log(err);
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
};