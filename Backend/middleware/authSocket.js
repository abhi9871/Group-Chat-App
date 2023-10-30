const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotEnv = require('dotenv');
dotEnv.config(); // To access env variables

const authenticateSocket = async (token) => {
    try {
        const userObj = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        const userId = userObj.id;
        const user = await User.findByPk(userId);
        return user;
    } catch (err) {
        console.log(err.message);
        return null;
    }
}

module.exports = {
    authenticateSocket
}
