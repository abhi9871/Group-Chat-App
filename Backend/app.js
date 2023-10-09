const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;

const app = express();

const userRoutes = require('./routes/user');

//Set cors options to allow specific origin for security
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    credentials: true,      // Credentials like cookies, authorization headers, etc
  };

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/user', userRoutes);

sequelize.sync()
.then(() => {
    console.log(`Server is starting at ${port}`);
    app.listen(port || 3000);
})
.catch(err => {
    console.log(err);
})