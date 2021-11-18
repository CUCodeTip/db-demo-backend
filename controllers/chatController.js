const Chat = require('../models/chatroom');
const message = require('../models/message');

// logics

// controllers
const chat_get_all_chat = (req, res) => {
  Chat.find()
    .sort({ createAt: -1 })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send('No chat in database');
    });
};

// get all the chat rooms that the user have joined
const chat_get_joined_chat = (req, res) => {
  try {
    // the id list of joined rides
    const rideIds = req.body.rides;
    const chats = [];
    for (const id of rideIds) {
      const chat = await Chat.find(id);
      chats.push(chat);
    }
    res.send(chats);
  } catch (err) {
    console.log(err.message);
    res.status(400).send('request error');
  }
};

const chat_create_chat = (req, res) => {
  try {
    const rideId = req.body.rideId;
    const title = req.body.title;
    const chatroom = new Chat(rideId, title);
    chatroom.save();
  } catch (err) {
    console.log(err.message);
    res.status(400).send('request error');
  }
};

const chat_details = (req, res) => {
  const id = req.params.id;
  Chat.findById(id)
    .then((result) => {
      const { rideId, title, messages } = result;
      // sort message by time
      messages.sort((a, b) => {
        if (a.createAt === b.createAt) return 0;
        return a.createdAt < b.createAt ? -1 : 1;
      });
      const sortedResult = { rideId, title, messages };
      res.send(sortedResult);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).send("chat doesn't exist");
    });
};

const chat_new_message = (req, res) => {};

const chat_delete_chat = (req, res) => {
  const id = req.params.id;
  Chat.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: '/chat' });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).send("chat doesn't exist");
    });
};

module.exports = {
  chat_create_chat,
  chat_get_all_chat,
  chat_create_chat,
  chat_details,
  chat_new_message,
  chat_delete_chat,
};
