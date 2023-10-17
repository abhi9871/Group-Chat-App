const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');
dotEnv.config(); // To access env variables

// Generate access token to authenticate the user
const generateToken =  (userId, userName) => {
    try {
        const secretKey = process.env.TOKEN_SECRET_KEY;
        const token = jwt.sign({ id: userId, name: userName }, secretKey, { expiresIn: '1h' });
        return token;
      } catch (error) {
        console.error('Error generating token:', error);
        throw error;
      }
}

// Sign up function
const createUser = async (req, res) => {
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
        if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
            const validationErrors = {};
            err.errors.forEach((error) => {
                validationErrors[error.path] = error.message;
            });
            res.status(400).json({ success: false, errors: validationErrors });
        } else {
            console.log(err);
            res.status(500).json({ success: false, message: "Internal server error." });
        }        
    }
};

// Login user function
const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
          // Generate a jwt token to encrypt user id
          const userId = user.id;
          const userName = user.name;
          const result = await bcrypt.compare(password, user.password);
          if(result){
              res.status(200).json({ success: true, token: generateToken(userId, userName) });
          }
          else {
              res.status(401).json({ success: false, message: "User not authorized" });
          }
      } else {
          res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (err) {
          res.status(500).json({ success: false, message: "An error occurred" });
    }
  };

module.exports = {
    generateToken,
    createUser,
    loginUser
}