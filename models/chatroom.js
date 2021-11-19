const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatroomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    messages: [
      {
        senderId: String,
        senderName: String,
        message: String,
        createAt: Date,
      },
    ],
  },
  { timestamps: true }
);

chatroomSchema.index(
  { messages: { senderId: 1, createAt: 1 } },
  { unique: true }
);
const Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = Chatroom;
