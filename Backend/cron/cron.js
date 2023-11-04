const Chat = require('../models/chat');
const ArchiveChat = require('../models/archivedchat');
const { Op } = require('sequelize');
const { CronJob } = require('cron');


const job = new CronJob('0 0 * * *', async function(){
    // Runs at midnight every day(0-minutes, 0-hours, *-days of the month, *-months, *-days of the week)
    try {
        // Calculate the date one day ago
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Fetching all the one day ago chat from the Chat table
        const oldChats = await Chat.findAll({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                },
            },
        });

        // Move chats into the Archived Chat table
        oldChats.map(async (oldChat) => {
                    await ArchiveChat.create({
                            message: oldChat.message,
                            userId: oldChat.userId,
                            groupId: oldChat.groupId,
                            chatCreatedDate: oldChat.createdAt
                });
        });

        // After moving the old chats into archived chats. Now delete the old chats from the Chat table
        await Chat.destroy({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                },
            },
        });
    } catch (err) {
        console.error('Error moving old chats:', err);
    }
})

module.exports = job;