const express = require('express');
const groupController = require('../controllers/group');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Create chat message route
router.post('/create-group', userAuthentication.authenticate, groupController.createGroup);

// Fetching all the chat messages route
router.get('/get-groups', userAuthentication.authenticate, groupController.showGroups);

module.exports = router;