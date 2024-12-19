const express = require('express');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;

// Serve the static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Attach Socket.IO to the server
const io = new Server(server);

const users = {}; // Store user info: { username: socket.id }

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Handle user registration
    socket.on('registerUser', (username, callback) => {
        if (users[username]) {
            callback({ success: false, message: 'Username already taken' });
        } else {
            users[username] = socket.id;
            callback({ success: true, token: `Token_${socket.id.substr(0, 4)}` });
            console.log(`User registered: ${username}`);
        }
    });

    // Handle private messages
    socket.on('privateMessage', ({ recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receiveMessage', {
                sender: Object.keys(users).find((user) => users[user] === socket.id),
                message,
            });
        } else {
            console.log(`Message to unknown recipient: ${recipient}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const disconnectedUser = Object.keys(users).find((user) => users[user] === socket.id);
        if (disconnectedUser) {
            delete users[disconnectedUser];
            console.log(`User disconnected: ${disconnectedUser}`);
        }
    });
});
