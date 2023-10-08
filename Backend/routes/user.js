const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

// Create user signup 
router.post('/signup', userController.createUser);

module.exports = router;