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


// Function for fetching the users for creating a new group
async function getUsersForNewGroup() {
    try {
        const response = await axios.get('http://localhost:4000/user/get-users', { headers: { "Authorization": token }});
        if(response.data.success) {
            const users = Array.from(response.data.users);
            return users;
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

// Function for fetching the participants to add into the existing group
async function getParticipantsForAddingIntoExistingGroup() {
    try {
        const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
        const response = await axios.get(`http://localhost:4000/group/get-participants?groupId=${groupId}`, { headers: { "Authorization": token }});
        if(response.data.success) {
            const users = response.data.users;
            return users;
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

// Function to fetch users and populate the dropdown
async function populateParticipants(buttonId) {
    try {
        const participantsContainer = document.getElementById('participants');
        participantsContainer.innerHTML = '';
        const modalHeadingTitle = document.getElementById('createGroupModalLabel');
        const groupNameField = document.getElementById('group-name');
        const createOrAddParticipantsGroupBtn = document.getElementById('group-button');
        let users;

        if(buttonId === 'create-group'){
            users = await getUsersForNewGroup();
            modalHeadingTitle.textContent = 'Create Group';
            createOrAddParticipantsGroupBtn.textContent = 'Create Group';
            createOrAddParticipantsGroupBtn.setAttribute('isExistingGroup', 'false');
            groupNameField.style.display = 'block';
        } else {
            users = await getParticipantsForAddingIntoExistingGroup();
            const groupName = localStorage.getItem('groupName');
            modalHeadingTitle.textContent = `${ groupName } - Add Participants`;
            createOrAddParticipantsGroupBtn.textContent = 'Add Participants';
            createOrAddParticipantsGroupBtn.setAttribute('isExistingGroup', 'true');
            groupNameField.style.display = 'none';
        }
        users.forEach(user => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'participants-list';
            const checkbox = document.createElement('input');
            checkbox.className = 'me-2'
            checkbox.type = 'checkbox';
            checkbox.name = 'participants';
            checkbox.value = user.id;

            const label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${user.name} - ${user.email}`));

            checkboxWrapper.appendChild(label);
            participantsContainer.appendChild(checkboxWrapper);
        });

        // Disabled if there is no any participants
        if(participantsContainer.children.length === 0){ 
            const message = document.createElement('p');
            message.textContent = 'No participants found.';
            participantsContainer.appendChild(message);
            createOrAddParticipantsGroupBtn.disabled = true;
        } else {
            createOrAddParticipantsGroupBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Add event listener to both the buttons to show the participants accordingly
document.getElementById('create-group').addEventListener('click', async (e) => {
    const buttonId = e.target.id;
    await populateParticipants(buttonId);
});

document.getElementById('add-member').addEventListener('click', async (e) => {
    const buttonId = e.target.id;
    await populateParticipants(buttonId);
});

// Create group form
const groupForm = document.getElementById('createGroupForm');

// Add event listener to the groupForm
groupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const createOrAddParticipantsGroupBtn = document.getElementById('group-button');
    const isExistingGroup = JSON.parse(createOrAddParticipantsGroupBtn.getAttribute('isExistingGroup'));
    if(isExistingGroup) {
        const groupName = localStorage.getItem('groupName');
        await addParticipantsToExistingGroup(groupName);
    } else {
        await createGroup();
    }
});

const searchBox = document.getElementById('participantsearch');
searchBox.addEventListener('keyup', searchParticipants);

// Search participants into the participants container
function searchParticipants(e) {
    let text = e.target.value.toLowerCase();
    let participants = document.getElementsByClassName('participants-list');
    // Convert to an array
    Array.from(participants).forEach((participant) => {
        let participantName = participant.textContent;
        if(participantName.toLowerCase().indexOf(text) !== -1){
            participant.style.display = 'block';
        }
        else {
            participant.style.display = 'none';
        }
    })
}

// Create group function
async function createGroup() {
    try {
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

// Show groups on screen function
function showGroupOnScreen(group) {
    const groupList = document.getElementById('groups-listing');
    const groupItem = document.createElement('div');
    groupItem.className = 'list-group-item text-center'
    groupItem.id = group.id;

    const groupTitle = document.createElement('div');
    groupTitle.textContent = group.name;
    groupTitle.className = 'fw-medium'
    groupTitle.style.cursor = 'pointer';
    groupTitle.style.display = 'inline-block';

    // Add event listener on each group to show their chats
    groupTitle.addEventListener('click', async () => {
        const groupHeading = document.getElementById('groupHeading');
        groupHeading.textContent = groupItem.textContent;
        localStorage.setItem('groupId', group.id);
        localStorage.setItem('groupName', group.name);

        const participantsBtn = document.getElementById('members');
        participantsBtn.style.display = 'block';

        const isUserAdmin = await isCurrentUserAdmin();  // Check whether the current user is admin or not after click on any group   
        if(isUserAdmin){
            const addMember = document.getElementById('add-member');
            addMember.style.display = 'block';
        } 
        await getMessages();
    });

    // Append the title to the groupItem
    groupItem.appendChild(groupTitle);

    // Append the groupItem to the groupList
    groupList.appendChild(groupItem);
}

// Show groups function
async function getGroups() {
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

// Get groupMembers function
async function getGroupMembers() {
    try {
        const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
        const response = await axios.get(`http://localhost:4000/group/group-members?groupId=${groupId}`, { headers: { 'Authorization': token }});
        if(response.data.success) {
            const users = response.data.users;
            return users;
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

// Show members on screen function
function showMembersOnScreen() {
    const members = document.getElementById('members');
        members.addEventListener('click', async (e) => {
            e.preventDefault();
            // Create a modal to show all the members belongs to the group
            const modal = document.getElementById('membersModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');

            const groupName = localStorage.getItem('groupName');

            modalTitle.textContent = `${ groupName } - Participants...😊`;
            modalTitle.className = 'text-center';
            modalBody.innerHTML = '';

            const users = await getGroupMembers();

            // Fetching the current user id from the token to check is current user admin or not
            const decodedToken = parseJwt(token);
            const currentUserId = Number.parseInt(decodedToken.id);
            const currentUserAdmin = await isCurrentUserAdmin();
            
            users.map((user) => {
                const memberWrapper = document.createElement('div');
                memberWrapper.className = 'd-flex justify-content-between align-items-center mb-2';
                const memberName = document.createElement('div');
                memberName.textContent = user.name;
                memberName.setAttribute('id', user.id);
                memberName.className = 'fw-medium mb-1';
                memberWrapper.appendChild(memberName);

                const btnWrapper = document.createElement('div');

                const makeAdminBtn = createButton('Make Admin', 'makeAdmin');
                const removeMemberBtn = createButton('Remove Member', 'removeMember');
                const groupAdmin = createBadge('Group Admin');

                // Add event listener to makeAdmin and removeMember button to achieve functionality
                const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
                const userName = user.name;

                makeAdminBtn.addEventListener('click', async (e) => {
                    const userId = Number.parseInt(e.target.parentElement.previousElementSibling.id);
                    await makeAdmin(userId, groupId, userName);        
                });

                removeMemberBtn.addEventListener('click', async (e) => {
                    const userId = Number.parseInt(e.target.parentElement.previousElementSibling.id);
                    await removeMember(userId, groupId, userName);
                });

                // If current user is admin
                if(currentUserAdmin){
                    if(currentUserId === user.id){
                        groupAdmin.style.display = 'block';
                        btnWrapper.appendChild(groupAdmin);
                } else if(currentUserId !== user.id && !user.isAdmin) {
                        removeMemberBtn.style.display = 'block';
                        makeAdminBtn.style.display = 'block';
                        btnWrapper.appendChild(removeMemberBtn);
                        btnWrapper.appendChild(makeAdminBtn);
                } else {
                    groupAdmin.style.display = 'block';
                    removeMemberBtn.style.display = 'block';
                    btnWrapper.appendChild(groupAdmin);
                    btnWrapper.appendChild(removeMemberBtn);
                }

                } else {
                    if(currentUserId !== user.id && user.isAdmin){
                        groupAdmin.style.display = 'block';
                        btnWrapper.appendChild(groupAdmin);
                    }
                }
                memberWrapper.appendChild(btnWrapper);
                modalBody.appendChild(memberWrapper);
                
            });
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();  
        })
}

// Create button function
function createButton(text, id) {
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-primary rounded-pill float-end mx-2 my-1';
    button.id = id;
    button.setAttribute('data-bs-dismiss', 'modal');
    button.textContent = text;
    button.style.display = 'none';
    return button;
}

// Create badge function
function createBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge rounded-pill bg-success p-2 float-end mx-2 my-1';
    badge.textContent = text;
    badge.style.display = 'none';
    return badge;
}

// Check whether the current user is admin or not after click on any group to show add participants option
async function isCurrentUserAdmin() {
    try {
        // Fetching the current user id from the token to check is current user admin or not
        const decodedToken = parseJwt(token);
        const currentUserId = Number.parseInt(decodedToken.id);
        const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
        const response = await axios.get(`http://localhost:4000/group/is-user-admin?userId=${currentUserId}&groupId=${groupId}`, { headers: { 'Authorization': token }});
        if(response.data.success){
            const isUserAdmin = response.data.currentUserAdmin.isAdmin;
            return isUserAdmin; 
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

// Make admin function
async function makeAdmin(userId, groupId, userName) {
    try {
        const response = await axios.put(`http://localhost:4000/group/make-admin?userId=${userId}&groupId=${groupId}`, null, { headers: { 'Authorization': token }});
        if(response.data.success){
            toastr.success(`${userName} is now an admin...😄`);
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

// Remove member from the group function
async function removeMember(userId, groupId, userName) {
    try {
        const response = await axios.get(`http://localhost:4000/group/remove-member?userId=${userId}&groupId=${groupId}`, { headers: { 'Authorization': token }});
        if(response.data.success){
            toastr.success(`${ userName } removed from the group...😔`);
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

// Add participants to the existing group
async function addParticipantsToExistingGroup(groupName) {
    try {
        const groupId = Number.parseInt(JSON.parse(localStorage.getItem('groupId')));
        const participants = document.querySelectorAll('input[type="checkbox"]:checked'); // Returns nodelist
        const memberList = Array.from(participants).map(participant => participant.value); // Converts the NodeList into an array
        const groupObj = {
            participants: memberList
       }
        const response = await axios.post(`http://localhost:4000/group/add-participants?groupId=${groupId}`, groupObj, { headers: { 'Authorization': token }});
        if(response.data.success){
            toastr.success(`Participants added to the ${groupName} group...😄`);
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

showMembersOnScreen();

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.removeItem('groupId');
    localStorage.removeItem('groupName');
    await getGroups();
    getLocalStorageChats();
});