const Chat = require('../models/chat');


exports.createChatMessage = async (req, res) => {
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