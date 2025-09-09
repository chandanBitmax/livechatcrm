// websocketServer.js
const { Server } = require('socket.io');

const io = new Server();

const clients = {}; // To store connected users

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user connection
    socket.on('userConnected', (userId) => {
        clients[userId] = socket;
        console.log(`User ${userId} connected.`);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const disconnectedUser = Object.keys(clients).find((key) => clients[key].id === socket.id);
        if (disconnectedUser) {
            delete clients[disconnectedUser];
            console.log(`User ${disconnectedUser} disconnected.`);
        }
    });
});

function sendRealTimeMessage({ userId, customerId, message }) {
    const client = clients[customerId];
    if (client) {
        client.emit('newMessage', { senderId: userId, message }); // Emit message to the receiver
        console.log(`Real-time message sent to user ${customerId}`);
    } else {
        console.error(`User ${customerId} is not connected.`);
    }
}

module.exports = { io, sendRealTimeMessage };
