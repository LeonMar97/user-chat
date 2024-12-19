document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000'); // Connect to the server

    // Confirm connection in browser console
    socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    // Handle registration form submission
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page refresh

        const username = document.getElementById('username').value;

        // Emit registration event to the server
        socket.emit('registerUser', username, (response) => {
            if (response.success) {
                document.getElementById('user-token').textContent = `Your Token: ${response.token}`;
                alert(`Welcome, ${username}!`);
            } else {
                alert('Username is already taken. Please choose another one.');
            }
        });
    });

    // Handle chat form submission
    document.getElementById('chat-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page refresh

        const recipient = document.getElementById('recipient').value;
        const message = document.getElementById('message').value;

        if (!recipient || !message) {
            alert('Please enter a recipient and a message.');
            return;
        }

        // Emit chat message to the server
        socket.emit('privateMessage', { recipient, message });

        // Add the message to the chat history (messages box)
        addMessageToHistory(`To ${recipient}: ${message}`);

        // Clear the message field
        document.getElementById('message').value = '';
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (data) => {
        addMessageToHistory(`From ${data.sender}: ${data.message}`);
    });

    // Function to append a new message to the chat history
    function addMessageToHistory(message) {
        const messagesBox = document.getElementById('messages');
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        messagesBox.appendChild(newMessage);

        // Scroll to the bottom of the messages box
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

});

// Open and close the chat form
function openForm() {
    document.getElementById('myForm').style.display = 'block';
    document.getElementsByClassName('open-button')[0].style.display = 'none';
}

function closeForm() {
    document.getElementById('myForm').style.display = 'none';
    document.getElementsByClassName('open-button')[0].style.display = 'block';
}
