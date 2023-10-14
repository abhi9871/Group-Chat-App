const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Create chat message route
router.post('/message', userAuthentication.authenticate, chatController.createChatMessage);

// Fetching all the chat messages route
router.get('/get-messages', userAuthentication.authenticate, chatController.getChatMessages);

module.exports = router;