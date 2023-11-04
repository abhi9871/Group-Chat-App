const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const ArchivedChat = sequelize.define('archivedchat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    message: {
        type: Sequelize.STRING,
        allowNull: false
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    chatCreatedDate: {
        type: Sequelize.DATE,
        allowNull: false
    }
})

module.exports = ArchivedChat;