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
            showMessageOnScreen(response.data.content);
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
        const response = await axios.get('http://localhost:4000/chat/get-messages', { headers: { "Authorization": token } });
        if(response.data.success){
            const messages = response.data.messages;
            messageContainer.innerHTML = '';
            messages.forEach((message) => {
                showMessageOnScreen(message.message);
            });
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

// Fetch all the messages while refreshing the page
window.addEventListener('DOMContentLoaded', async () => {
   await getMessages();
})
