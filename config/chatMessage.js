const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
    expires: '48h' // TTL index to automatically delete documents after 48 hours
  },
  userId: String, // Store user ID
  username: String, // Store the username
  productId: String, // Store the product ID related to the message
  sendermail: String,
  receivermail: String,
  category:String,
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
