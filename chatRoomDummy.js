const Chat = require('./models/chatroom');
const mongoose = require('mongoose');
const chatrooms = require('./chatlist.json');

require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('connected to mongoDB');
    // listen for requests
  })
  .catch((err) => console.log(err.message));

const populateChat = () => {
  console.log(chatrooms);
  Chat.insertMany(chatrooms)
    .then(() => {
      console.log('data inserted');
    })
    .catch((err) => console.log(err.message));
};

populateChat();
