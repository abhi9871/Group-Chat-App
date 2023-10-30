const Chat = require('../models/chat');
const { Op } = require('sequelize');
const authSocket = require('../middleware/authSocket');

//Function to display all the messages
const getChatMessages = async (req, res) => {
    try {
        const groupId = req.query.groupId;
        const lastMessageId = req.query.lastMessageId;
        const messages = await Chat.findAll({ where: { groupId: groupId, id: { [Op.gt]: lastMessageId } } });
        if(messages) {
            res.status(200).json({ success: true, messages: messages });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error while fetching the messages' });
        console.log(err);
    }
}

const io = require('socket.io')(5000, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

io.on('connection', async (socket) => {
    console.log(`a user connected: ${socket.id}`);

    const token = socket.handshake.auth.token;
    const user = await authSocket.authenticateSocket(token);

    if (user) {
        socket.user = user; // Associate user information with the socket
    }

    // Send message 
    socket.on('message', async (data) => {
        try {
            const { message, groupId } = data;
            // Check for blank group id
            if(!groupId){
                return;
            }
            const msg = await Chat.create({
                message: message,
                userId: socket.user.id, // just like req.user.id
                groupId: groupId
            });
            if (msg) {
                // Emit the message to all clients in the group
                io.emit('newMessage', msg);  
            }
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
      });
});

module.exports = {
    getChatMessages
}