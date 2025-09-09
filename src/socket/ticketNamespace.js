module.exports = (ticketNamespace) => {
  ticketNamespace.on('connection', (socket) => {
    console.log('Connected to Ticket Namespace:', socket.id);

    socket.on('ticketUpdate', (ticket) => {
      ticketNamespace.emit('ticketUpdated', ticket);
    });

    socket.on('disconnect', () => {
      console.log('Ticket socket disconnected:', socket.id);
    });
  });
};
