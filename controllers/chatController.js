const Chat = require('../models/chatroom');

// controllers
const chat_get_chats = (req, res) => {
  if (Object.keys(req.body).length > 0) {
    const ids = JSON.parse(req.body.ids);
    Chat.find({ _id: { $in: ids } }, { title: 1, _id: 1 })
      .then((result) => res.json(result))
      .catch((err) => {
        console.log(err.message);
        res.status(404).send('request error');
      });
    return;
  }
  Chat.find()
    .sort({ createAt: -1 })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send('No chat in database');
    });
};

const chat_create_chat = async (req, res) => {
  try {
    const title = req.body.title;
    const chatroom = new Chat({ title });
    await chatroom.save();
    res.status(201).send('Chat created!!' + chatroom._id);
  } catch (err) {
    console.log(err.message);
    res.status(400).send('request error');
  }
};

const chat_get_single_chat = (req, res) => {
  const id = req.params.id;
  Chat.findById(id, {
    _id: 1,
    title: 1,
    messages: { senderName: 1, createAt: 1, message: 1 },
  })
    .then((result) => {
      const { _id: id, title, messages } = result;
      // sort message by time
      messages.sort((a, b) => {
        if (a.createAt === b.createAt) return 0;
        return a.createdAt < b.createAt ? -1 : 1;
      });
      const sortedResult = { id, title, messages };
      res.json(sortedResult);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).send("chat doesn't exist");
    });
};

const chat_new_message = async (req, res) => {
  try {
    const id = req.params.id;
    const chat = await Chat.findById(id);
    if (Object.keys(req.body).length === 3) {
      // check if the req.body have correct field
      const { senderId, senderName, message } = req.body;
      const createAt = new Date();
      chat.messages.push({ senderId, senderName, message, createAt });
      await chat.save();
      res.status(201).send('message successfully send!!');
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send('request error');
  }
};

const chat_delete_chat = (req, res) => {
  const id = req.query.id;
  Chat.findByIdAndDelete(id)
    .then((result) => {
      res.status(202);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).send("chat doesn't exist");
    });
};

module.exports = {
  chat_create_chat,
  chat_get_chats,
  chat_create_chat,
  chat_get_single_chat,
  chat_new_message,
  chat_delete_chat,
};
