const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

// Create user signup route
router.post('/signup', userController.createUser);

// Create login user route
router.post('/login', userController.loginUser);

module.exports = router;