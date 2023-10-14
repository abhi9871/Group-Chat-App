const Chat = require('../models/chat');

//Function to create chat messages
const createChatMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const msg =  await Chat.create({
            message: message,
            userId: req.user.id,
        })
        if(msg) {
            res.status(200).json({ success: true, content: message });
        }
        else {
            res.status(400).json({ success: false, message: 'Error while storing the message' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
}

//Function to display all the messages
const getChatMessages = async (req, res) => {
    try {
        const messages = await Chat.findAll({ where: { userId: req.user.id } });
        if(messages) {
            res.status(200).json({ success: true, messages: messages });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error while fetching the messages' });
        console.log(err);
    }
}

module.exports = {
    createChatMessage,
    getChatMessages
}