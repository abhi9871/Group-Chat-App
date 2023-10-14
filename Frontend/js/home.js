const messageSendBtn = document.getElementById('sendMessage');
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
        const error = err.response.data.message;
        console.log(err);
        toastr.error(error);
    }
};

function showMessageOnScreen(message) {
    const messageBody = document.querySelector('.card-body');
    const messageElement = document.createElement('div');
        messageElement.classList.add('border', 'p-3', 'mb-3', 'rounded', 'bg-light');
        messageElement.style.display = 'inline-block';
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
        `;
        messageBody.appendChild(messageElement);
}
