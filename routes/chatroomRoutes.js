const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/chat', chatController.chat_get_all_chat);
router.post('/chat', chatController.chat_get_joined_chat);
router.post('/chat/create', chatController.chat_create_chat);
router.get('/chat/:id', chatController.chat_details);
router.put('/chat/:id', chatController.chat_new_message);
router.delete('/chat/:id', chatController.chat_delete_chat);

module.exports = router;
