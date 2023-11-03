const messageSendBtn = document.getElementById('sendMessage');
const messageContainer = document.querySelector('.card-body');
const sendMediaMessage = document.getElementById('fileInput');
const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', { auth: { token: token } });

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
    // Condition for checking blank messages
    if(!messages.message){
        return;
    }
    const decodedToken = parseJwt(token);
    const userId = Number.parseInt(decodedToken.id);
    const messageElement = document.createElement('div');
    messageElement.style.display = 'flex';
    messageElement.className = (messages.userId === userId) ? 'flex-row-reverse' : 'flex-row';
    messageElement.style.alignItems = 'center';
    
    // Show the images into the chat box
    if(messages.message.includes('image')){
            const imgElement = document.createElement('img');
            imgElement.src = messages.message;
            imgElement.classList.add('img-fluid', 'w-50', 'my-3'); // Add Bootstrap class for responsiveness
            imgElement.style.cursor = 'pointer';
            imgElement.addEventListener('click', () => {
                showMediaMsgOnFullScreen(messages.message, 'img');
        });
                messageElement.appendChild(imgElement);

        // Show the videos into the chat box
    } else if(messages.message.includes('video')){
                const videoElement = document.createElement('video');
                videoElement.src = messages.message;
                videoElement.classList.add('embed-responsive', 'w-50', 'my-3'); // Add Bootstrap class for responsiveness
                videoElement.style.cursor = 'pointer';
                videoElement.controls = true;
                videoElement.addEventListener('click', (event) => {
                    // Events conditions only work when someone clicks on the play button not everywhere 
                    if (event.target.paused) {
                            event.target.play();
                    } else {
                            event.target.pause();
                    }
                    showMediaMsgOnFullScreen(messages.message, 'video');
                });
                messageElement.appendChild(videoElement);
        
        // Show other media types such as pdf, docs, and many more
    } else if(messages.message.includes('application')) {
                const link = document.createElement('a');
                link.classList.add('message', 'message-content', 'border', 'p-3', 'mb-2', 'rounded-4', 'bg-light', 'text-decoration-none');
                link.style.width = 'auto';
                link.style.maxWidth = '50%';
                link.href = messages.message;
                link.textContent = messages.message;
                link.download = 'Document';
                link.target = '_blank';
                messageElement.appendChild(link);

        // Show text messages into the chat box
    } else {
            const textElement = document.createElement('div');
            textElement.classList.add('message', 'message-content', 'border', 'p-3', 'mb-2', 'rounded-4', 'bg-light');
            textElement.style.width = 'auto';
            textElement.style.maxWidth = '50%';
            textElement.textContent = messages.message;
            messageElement.appendChild(textElement);
    }  
        messageContainer.appendChild(messageElement);
        scrollToBottom();
}

// Show media on full screen
function showMediaMsgOnFullScreen(mediaMsg, type) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    
    const overlayImg = document.createElement(type);
    overlayImg.src = mediaMsg;
    if(type === 'video'){
        overlayImg.controls = 'controls';
    }
    overlayImg.classList.add('overlay-img');
    
    overlay.appendChild(overlayImg);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
    overlay.remove();
});
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

        // Check for blank id
        if(!groupId) {
            toastr.error('No group exists');
            messageBox.value = '';
            return;
        }

        // Emit the message to the server
        socket.emit('message', { message: messageContent, groupId: groupId });

        messageBox.value = '';

    } catch (err) {
        console.log(err);
    }
};

// Add event listener to the sendMedia field
sendMediaMessage.addEventListener('change', sendMedia);

// Send media messages into the group chat function
async function sendMedia(e) {
    try {
        e.preventDefault();
        const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
        const file = e.target.files[0]; // Get the selected file
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`http://localhost:4000/chat/upload?groupId=${groupId}`, formData, { headers: { "Authorization": token }});
        sendMessages('', groupId);
    } catch (error) {
        console.error('Error while sending media:', error);
      }
}

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

// Show messages in real time without polling
socket.on('newMessage', (msg) => {
    getMessages();
});

