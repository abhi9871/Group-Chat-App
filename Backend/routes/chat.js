const express = require('express');
const chatController = require('../controllers/chat');
const userAuthentication = require('../middleware/auth');
const multer = require('multer');

// Customizing the file name
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../uploads/'); // Define the destination directory for uploaded files
    },
    filename: function (req, file, cb) {
      const mediaType = file.mimetype.split('/')[0];
      const fileName = `${mediaType}_${file.originalname}`;
      cb(null, fileName); // Set the filename as 'image_filename' or 'video_filename'
    }
  });

const upload = multer({ storage: storage });

const router = express.Router();

// Add media into the chats route
router.post('/upload', upload.single('file'), userAuthentication.authenticate, chatController.sendMediaMessage);

// Fetching all the chat messages route
router.get('/get-messages', userAuthentication.authenticate, chatController.getChatMessages);

module.exports = router;