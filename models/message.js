const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageShema = new Schema(
  {
    senderId: mongoose.Types.ObjectId,
    message: String,
  },
  { timestamps: true }
);

messageShema.index({ senderId: 1, createdAt: 1 }, { unique: true });

module.exports = messageShema;
