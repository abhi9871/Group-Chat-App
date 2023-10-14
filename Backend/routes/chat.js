const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Create chat message route
router.post('/message', userAuthentication.authenticate, chatController.createChatMessage);

module.exports = router;