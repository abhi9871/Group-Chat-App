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

// Function to fetch users and populate the dropdown
async function populateParticipants() {
    const participantsContainer = document.getElementById('participants');
    try {
        const response = await axios.get('http://localhost:4000/user/get-users', { headers: { "Authorization": token }});
        const users = response.data.users;
        users.forEach(user => {
            const checkboxWrapper = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.className = 'me-2'
            checkbox.type = 'checkbox';
            checkbox.name = 'participants';
            checkbox.value = user.id;

            const label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(user.email));

            checkboxWrapper.appendChild(label);
            participantsContainer.appendChild(checkboxWrapper);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Call the function to populate the participants field in the create group form
populateParticipants();

const groupForm = document.getElementById('createGroupForm');

// Add event listener to the groupForm
groupForm.addEventListener('submit', createGroup);

async function createGroup(e) {
    try {
        e.preventDefault();
       const groupName = document.getElementById('groupName');
       const participants = document.querySelectorAll('input[type="checkbox"]:checked'); // Returns nodelist
       const memberList = Array.from(participants).map(participant => participant.value); // Converts the NodeList into an array
       const groupObj = {
            groupName: groupName.value,
            participants: memberList
       }
       const response = await axios.post('http://localhost:4000/group/create-group', groupObj, { headers: { 'Authorization': token }});
       if(response.data.success) {
            toastr.success(`${ response.data.group.name } group is created successfully..😊`);
            showGroupOnScreen(response.data.group);
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
}

function showGroupOnScreen(group) {
    const groupList = document.querySelector('#groups-listing');
    const groupItem = document.createElement('a');
    groupItem.className = 'list-group-item list-group-item-action text-center'
    // Set the text content of the anchor
    groupItem.setAttribute('groupId', group.id);
    groupItem.textContent = group.name;
    groupItem.style.cursor = 'pointer';
    // Add event listener on each group to show their chats
    groupItem.addEventListener('click', async () => {
        const groupHeading = document.getElementById('groupHeading');
        groupHeading.textContent = groupItem.textContent;
        localStorage.setItem('groupId', group.id);
        await getMessages();  
    });

    // Append the anchor to the groupList
    groupList.appendChild(groupItem);
}

// Show groups
async function showGroups() {
    try {
        const response = await axios.get('http://localhost:4000/group/get-groups', { headers: { 'Authorization': token }});
        if(response.data.success) {
            const groups = response.data.groups;
            groups.map(group => showGroupOnScreen(group));
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
}

window.addEventListener('DOMContentLoaded', async () => {
    await showGroups();
    getLocalStorageChats();
});