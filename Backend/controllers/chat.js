const Chat = require('../models/chat');
const { Op } = require('sequelize');

//Function to create chat messages
const createChatMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const groupId = req.query.groupId;
        const msg =  await Chat.create({
            message: message,
            userId: req.user.id,
            groupId: groupId
        })
        if(msg) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(400).json({ success: false, message: 'Error while storing the message' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'No group exists' });
    }
}

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

module.exports = {
    createChatMessage,
    getChatMessages
}