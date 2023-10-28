const express = require('express');
const groupController = require('../controllers/group');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Create chat message route
router.post('/create-group', userAuthentication.authenticate, groupController.createGroup);

// Fetching all the chat messages route
router.get('/get-groups', userAuthentication.authenticate, groupController.getGroups);

// Get members for group route
router.get('/group-members', userAuthentication.authenticate, groupController.getMembersForGroup);

// Make an admin of the group
router.put('/make-admin', userAuthentication.authenticate, groupController.makeAdmin);

// Check if a user admin or not route
router.get('/is-user-admin', userAuthentication.authenticate, groupController.isUserAdmin);

// Remove member from the group route
router.get('/remove-member', userAuthentication.authenticate, groupController.removeMember);

// Get participants for adding into the existing group route
router.get('/get-participants', userAuthentication.authenticate, groupController.getParticipants);

// Add participants to the existing group route
router.post('/add-participants', userAuthentication.authenticate, groupController.addParticipantsToExistingGroup);

module.exports = router;