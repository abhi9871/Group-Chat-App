const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            args: 'email',
            msg: 'Email already exists'
        },
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address' // Custom error message
            }
        }
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            args: 'phone',
            msg: 'Phone number already exists'
        },
        validate: {
            is: /^[0-9]{10}$/, // Regular expression to validate a 10-digit phone number
            len: {
                args: [10, 10],
                msg: 'Phone number must be 10 digits'
            }
        },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8, 100], // Password length should be between 8 and 100 characters
                msg: 'Password must be atleast 8 characters long' // Custom error message
            }
        }
    }
})

module.exports = User;