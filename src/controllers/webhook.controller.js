
// ✅ Controller: src/controllers/webhook.controller.js
const { sendRealTimeMessage } = require('../middleware/messageMiddleware');
const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');

exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};
exports.receiveWebhookMessage = async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0]?.value;

  const messages = changes?.messages;
  if (!messages) return res.sendStatus(200);

  try {
    for (const msg of messages) {
      const from = msg.from;
      const text = msg.text?.body;
      const timestamp = new Date(Number(msg.timestamp) * 1000);
      const petitionToken = uuidv4();

      const newMessage = await Message.create({
        message: text,
        source: 'whatsapp',
        timestamp,
        petitionToken,
        status: 'received',
        userId: null,
        from,
        to: changes.metadata?.display_phone_number,
        platform: 'whatsapp',
        direction: 'incoming',
        isRead: false
      });

      sendRealTimeMessage({ userId: null, applicantId: null, message: newMessage });

      console.log(`✅ Message received from ${from}`);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error processing incoming message:', error);
    return res.sendStatus(500);
  }
};
