const messageSendBtn = document.getElementById('sendMessage');
const messageContainer = document.querySelector('.card-body');
const token = localStorage.getItem('token');

// Initialize Toastr options
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

// Show messages on screen
function showMessageOnScreen(messages) {
    const messageElement = document.createElement('div');
        messageElement.style.display = 'flex';
        messageElement.style.alignItems = 'center';
        messageElement.innerHTML = `
            <div class="message message-content border p-3 mb-2 rounded-4 bg-light">${messages}</div>
        `;
        messageContainer.appendChild(messageElement);
        scrollToBottom();
}

// Add this function to scroll to the bottom
function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Add event listener to the button to send message
messageSendBtn.addEventListener('click', sendMessages);

// Function to send messages
async function sendMessages() {
    try {
        const messageBox = document.getElementById('message');
        const messageContent = messageBox.value;
        const response = await axios.post('http://localhost:4000/chat/message', { message: messageContent }, { headers: { "Authorization": token }});
        if(response.data.success) {
            messageBox.value = '';
        }
    } catch (err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.success === false) {
            const errorMessage = err.response.data.message;
            toastr.error(errorMessage);
        } else {
            // Handle other errors (e.g., network errors) or provide a generic error message.
            toastr.error("An error occurred");
        }
    }
};

async function getMessages() {
    try {
        let localStorageChats = localStorage.getItem('chats');
        let localChats = localStorageChats ? JSON.parse(localStorageChats) : [];
        let lastMessageId = localChats.length > 0 ? localChats[localChats.length - 1].id : 0;
        const response = await axios.get(`http://localhost:4000/chat/get-messages?lastMessageId=${lastMessageId}`, { headers: { "Authorization": token } });
        if(response.data.success){
            const messages = response.data.messages;
            messages.forEach((message) => {
                localChats.push(message);
            })
            localStorage.setItem('chats', JSON.stringify(localChats));
        }   
    } catch (err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.success === false) {
            const errorMessage = err.response.data.message;
            toastr.error(errorMessage);
        } else {
            // Handle other errors (e.g., network errors) or provide a generic error message.
            toastr.error("Something went wrong.");
        }
    }
}

// Retrieve message from the local storage and show on the screen
function getLocalStorageChats() {
    const chatArr = JSON.parse(localStorage.getItem('chats'));
    messageContainer.innerHTML = '';
    chatArr.forEach((message) => {
        showMessageOnScreen(message.message);
    })
}

// Refreshing the page to get new messages after every 1 second
setInterval(() =>{
    getMessages();
    getLocalStorageChats();
}, 1000)

// Fetch all the messages while refreshing the page
window.addEventListener('DOMContentLoaded', () => {
    getLocalStorageChats();
})
