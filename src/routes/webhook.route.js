// ✅ Route: src/routes/webhook.routes.js
const express = require('express');
const { verifyWebhook, receiveWebhookMessage } = require('../controllers/webhook.controller');
const router = express.Router();

router.get('/', verifyWebhook);
router.post('/', receiveWebhookMessage);

module.exports = router;