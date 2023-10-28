const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const User = require('./models/user');
const ChatMessages = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/usergroup');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;

const app = express();

// Association between models
User.hasMany(ChatMessages);
ChatMessages.belongsTo(User);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });
UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

Group.hasMany(ChatMessages);
ChatMessages.belongsTo(Group);

// Routes
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');

//Set cors options to allow specific origin for security
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    credentials: true,      // Credentials like cookies, authorization headers, etc
  };

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

sequelize.sync()
.then(() => {
    console.log(`Server is starting at ${port}`);
    app.listen(port || 3000);
})
.catch(err => {
    console.log(err);
})