const express = require('express');
const userController = require('../controllers/user');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Create user signup route
router.post('/signup', userController.createUser);

// Create login user route
router.post('/login', userController.loginUser);

// Get all the users route
router.get('/get-users', userAuthentication.authenticate, userController.getUsers);

module.exports = router;