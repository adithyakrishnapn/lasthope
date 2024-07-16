const ChatMessage = require('../config/chatMessage');

const saveMessageToDatabase = async ({ productId, userId, username, message, sendermail, receivermail , category}) => {
  try {
    const newMessage = new ChatMessage({
      productId,
      userId,
      username,
      message,
      sendermail,
      receivermail,
      category
    });
    await newMessage.save();
    console.log('Message saved successfully:', newMessage); // Log the saved message
  } catch (error) {
    console.error('Error saving message to database:', error); // Log the error
  }
};

module.exports = { saveMessageToDatabase };
