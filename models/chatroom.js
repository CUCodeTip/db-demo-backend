const mongoose = require('mongoose');
const Message = require('message');
const Schema = mongoose.Schema;

const chatroomSchema = new Schema(
  {
    rideId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [Message],
  },
  { timestamps: true }
);

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = Chatroom;
