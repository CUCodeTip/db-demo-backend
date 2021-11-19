const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/', chatController.chat_get_chats);
router.post('/create', chatController.chat_create_chat);
router.get('/:id', chatController.chat_get_single_chat);
router.post('/:id', chatController.chat_new_message);
router.delete('/', chatController.chat_delete_chat);

module.exports = router;
