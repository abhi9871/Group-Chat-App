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

// Decoding a token to obtain user's id
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Show messages on screen
function showMessageOnScreen(messages) {
    const decodedToken = parseJwt(token);
    const userId = Number.parseInt(decodedToken.id);
    const messageElement = document.createElement('div');
    messageElement.style.display = 'flex';
    messageElement.className = (messages.userId === userId) ? 'flex-row-reverse' : '';
    messageElement.style.alignItems = 'center';
    messageElement.innerHTML = `
            <div class="message message-content border p-3 mb-2 rounded-4 bg-light">${messages.message}</div>
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
        const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
        const response = await axios.post(`http://localhost:4000/chat/create-message?groupId=${groupId}`, { message: messageContent }, { headers: { "Authorization": token }});
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

// Fetching all the messages based on group id
async function getMessages() {
    try {
        let localStorageGroupId = localStorage.getItem('groupId');
        let localStorageChats = localStorage.getItem(`chats_${localStorageGroupId}`);
        
        // Check if this exists in localStorage or not
        let localChats = localStorageChats ? JSON.parse(localStorageChats) : [];
        let lastMessageId = localChats.length > 0 ? localChats[localChats.length - 1].id : 0;
        let groupId = localStorageGroupId ? Number.parseInt(JSON.parse(localStorageGroupId)) : 0;

        const response = await axios.get(`http://localhost:4000/chat/get-messages?groupId=${groupId}&lastMessageId=${lastMessageId}`, { headers: { "Authorization": token } });
        if(response.data.success){
            const messages = response.data.messages;
            messages.forEach((message) => {
                localChats.push(message);
            });
            localStorage.setItem(`chats_${localStorageGroupId}`, JSON.stringify(localChats));
            getLocalStorageChats();
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
    let localStorageGroupId = localStorage.getItem('groupId');
    const chatArr = JSON.parse(localStorage.getItem(`chats_${localStorageGroupId}`));
    messageContainer.innerHTML = '';
    if (chatArr) { // Check if chatArr is not null or undefined
        chatArr.forEach((message) => {
            showMessageOnScreen(message);
        });
    }
}

// Refreshing the page to get new messages after every 1 second
setInterval(() =>{
    getMessages();
}, 1000)