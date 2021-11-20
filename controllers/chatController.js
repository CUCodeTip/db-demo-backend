const Chat = require('../models/chatroom');
const connection = require('../mySQL');

// logics
const getRideWithChatId = (chatId, rides) => {
  const wantedRide = rides.filter((ride) => ride.chat_id === chatId.toString());
  return wantedRide[0];
};

// controllers
const chat_get_chats = (req, res) => {
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

// this will return for both as a passenger and a driver;
const chat_get_joining_chats = (req, res) => {
  const userId = req.body.userId;
  const query =
    'SELECT\
        p.name,\
        data.driver_id AS user_id,\
        data.starting_time,\
        data.chat_id,\
        data.route,\
        data.ride_status,\
        data.max_available_seats,\
        data.reserved_passengers\
    FROM passenger p\
    JOIN(\
        SELECT\
            r1.driver_id,\
            r1.starting_time,\
            r1.chat_id,\
            r1.route,\
            r1.ride_status,\
            r1.max_available_seats,\
            r1.reserved_passengers\
        FROM booking b \
        JOIN ride r1\
        USING (driver_id, starting_time)\
        WHERE b.passenger_id = ?\
        UNION\
        SELECT\
            *\
        FROM ride r2\
        WHERE r2.driver_id = ?\
        ) data\
    ON p.user_id = data.driver_id';

  connection.query(query, [userId, userId], (err, result) => {
    if (err) {
      res.status(404).send('No booking rides');
      return;
    }
    // get chats from mongos
    const ids = result.map((ride) => ride.chat_id);
    Chat.find({ _id: { $in: ids } }, { _id: 1, messages: 1 })
      .then((data) => {
        // data to be send to the request client
        const chats = data.map((value) => {
          // information of single ride
          const ride = getRideWithChatId(value._id, result);
          console.log(ride);

          const chat = {
            chat_id: ride.chat_id,
            driver_name: ride.name,
            driver_id: ride.user_id,
            starting_time: ride.starting_time,
            max_available_seats: ride.max_available_seats,
            reserved_passengers: ride.reserved_passengers,
            recentMessage:
              value.messages.length > 0
                ? value.messages[value.messages.length - 1]
                : undefined,
          };
          return chat;
        });

        res.send(chats);
      })
      .catch((err) => {
        // have a error when qeurying for chats
        console.log(err.message);
        res.status(404).send('No requested chat room');
      });
  });
};

const chat_get_single_chat = (req, res) => {
  const id = req.params.ChatId;
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

const chat_new_message = async (req, res) => {
  try {
    const id = req.params.ChatId;
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
  const id = req.query.ChatId;
  Chat.findByIdAndDelete(id)
    .then((result) => {
      res.sendStatus(202);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).send("chat doesn't exist");
    });
};

module.exports = {
  chat_get_chats,
  chat_get_single_chat,
  chat_get_joining_chats,
  chat_create_chat,
  chat_new_message,
  chat_delete_chat,
};
