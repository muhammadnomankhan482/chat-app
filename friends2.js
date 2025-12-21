import { 
    auth, collection, db, getDocs, onAuthStateChanged, query, 
    signOut, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc
} from "./config.js";

let currentUserId = null;
let currentUserDocId = null;
let currentUserData = null;
let allPeople = [];
let allRequests = [];
let allFriends = [];

function userChecking() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            loadAllData(currentUserId);
        } else {
            window.location.replace("./login.html");
        }
    });
}

userChecking();

window.signout = function () {
    signOut(auth).then(() => {
        window.location.replace("./login.html");
    }).catch((error) => {
        console.error("Sign out error:", error);
    });
}

async function loadAllData(currentUserId) {
    try {
        // Get current user document
        const currentUserQuery = query(collection(db, "users"), where("userId", "==", currentUserId));
        const currentUserSnapshot = await getDocs(currentUserQuery);
        
        if (currentUserSnapshot.empty) {
            console.error("Current user not found");
            return;
        }
        
        currentUserData = currentUserSnapshot.docs[0].data();
        currentUserDocId = currentUserSnapshot.docs[0].id;
        
        // Update user info
        document.getElementById("user-avatar").innerHTML = 
            `${currentUserData.firstName[0]}${currentUserData.lastName[0]}`;
        document.getElementById("user-name").innerHTML = 
            currentUserData.firstName + " " + currentUserData.lastName;

        // Load all three sections
        loadPeopleYouMayKnow(currentUserId, currentUserData, currentUserDocId);
        loadFriendRequests(currentUserId, currentUserDocId);
        loadFriends(currentUserId, currentUserData, currentUserDocId);

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

async function loadPeopleYouMayKnow(currentUserId, currentUserData, currentUserDocId) {
    try {
        const q = query(collection(db, "users"), where("userId", "!=", currentUserId));
        const querySnapshot = await getDocs(q);
        
        let chatList = document.getElementById("chatList");
        allPeople = [];
        
        for (const docSnap of querySnapshot.docs) {
            const userData = docSnap.data();
            const userId = userData.userId;
            const userDocId = docSnap.id;

            // Skip if already friend
            if (currentUserData.friends && currentUserData.friends.includes(userId)) {
                continue;
            }

            let buttonText, buttonFunction;

            if (currentUserData.sentRequests && currentUserData.sentRequests.includes(userId)) {
                buttonText = "Cancel Request";
                buttonFunction = `cancelRequest('${currentUserId}', '${userId}', '${currentUserDocId}', '${userDocId}')`;
            } else if (currentUserData.friendRequest && currentUserData.friendRequest.includes(userId)) {
                buttonText = "Accept Request";
                buttonFunction = `acceptFriendRequest('${currentUserId}', '${userId}', '${currentUserDocId}', '${userDocId}')`;
            } else {
                buttonText = "Add Friend";
                buttonFunction = `addFriend('${currentUserId}', '${userId}', '${currentUserDocId}', '${userDocId}')`;
            }

            const userItem = {
                id: userId,
                docId: userDocId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                buttonText: buttonText,
                buttonFunction: buttonFunction,
                html: `
                    <div class="chat-item">
                        <div class="chat-avatar">
                            ${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">${userData.firstName} ${userData.lastName}</div>
                            <div class="last-message">${userData.email || ""}</div>
                        </div>
                        <div class="user-info">
                            <button class="logout-btn" onClick="${buttonFunction}" id="btn-${userId}">
                                ${buttonText}
                            </button>
                        </div>
                    </div>`
            };
            
            allPeople.push(userItem);
        }

        renderPeopleList();

    } catch (error) {
        console.error("Error loading users:", error);
        document.getElementById("chatList").innerHTML = `<p class="text-center text-gray-500">Error loading users</p>`;
    }
}

function renderPeopleList() {
    let chatList = document.getElementById("chatList");
    if (allPeople.length === 0) {
        chatList.innerHTML = `<p class="text-center text-gray-500">No users to show</p>`;
        return;
    }
    
    chatList.innerHTML = allPeople.map(person => person.html).join('');
}

async function loadFriendRequests(currentUserId, currentUserDocId) {
    try {
        let usersContainer = document.getElementById("friendRequest");
        usersContainer.innerHTML = "";
        
        const docRef = doc(db, "users", currentUserDocId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.log("No such document!");
            usersContainer.innerHTML = `<p class="text-center text-gray-500">No user data found</p>`;
            return;
        }

        const currentUserData = docSnap.data();
        const { friendRequest } = currentUserData;

        if (!friendRequest || friendRequest.length === 0) {
            usersContainer.innerHTML = `<p class="text-center text-gray-500">No friend requests</p>`;
            allRequests = [];
            return;
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where('userId', 'in', friendRequest));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            usersContainer.innerHTML = `<p class="text-center text-gray-500">No users found for these friend requests</p>`;
            allRequests = [];
            return;
        }

        allRequests = [];
        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const { firstName, lastName, userId } = user;
            const friendDocId = docSnap.id;
            
            const requestItem = {
                id: userId,
                docId: friendDocId,
                firstName: firstName,
                lastName: lastName,
                html: `
                    <div class="chat-item">
                        <div class="chat-avatar">
                            ${firstName.charAt(0)}${lastName.charAt(0)}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">${firstName} ${lastName}</div>
                            <div class="last-message">Sent you a friend request</div>
                        </div>
                        <div class="user-info">
                            <button class="accept-btn" onClick="acceptFriendRequestFromList('${currentUserId}', '${userId}', '${currentUserDocId}', '${friendDocId}')">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="decline-btn" onClick="declineFriendRequest('${currentUserId}', '${userId}', '${currentUserDocId}')">
                                <i class="fas fa-times"></i> Decline
                            </button>
                        </div>
                    </div>`
            };
            
            allRequests.push(requestItem);
        });

        renderRequestsList();

    } catch (error) {
        console.error("Error loading friend requests:", error);
        document.getElementById("friendRequest").innerHTML = `<p class="text-center text-gray-500">Error loading requests</p>`;
    }
}

function renderRequestsList() {
    let container = document.getElementById("friendRequest");
    if (allRequests.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500">No friend requests</p>`;
        return;
    }
    
    container.innerHTML = allRequests.map(request => request.html).join('');
}

async function loadFriends(currentUserId, currentUserData, currentUserDocId) {
    try {
        let friendsContainer = document.getElementById("friends");
        friendsContainer.innerHTML = "";
        
        const { friends } = currentUserData;

        if (!friends || friends.length === 0) {
            friendsContainer.innerHTML = `<p class="text-center text-gray-500">No friends yet. Add some friends!</p>`;
            allFriends = [];
            return;
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where('userId', 'in', friends));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            friendsContainer.innerHTML = `<p class="text-center text-gray-500">No friends data found</p>`;
            allFriends = [];
            return;
        }

        allFriends = [];
        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const { firstName, lastName, userId } = user;
            
            const friendItem = {
                id: userId,
                firstName: firstName,
                lastName: lastName,
                html: `
                    <div class="chat-item">
                        <div class="chat-avatar friend-avatar">
                            ${firstName.charAt(0)}${lastName.charAt(0)}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">${firstName} ${lastName}</div>
                            <div class="last-message">Click to start chatting</div>
                        </div>
                        <div class="user-info">
                            <button class="friends-btn" onclick="startChat('${userId}', '${firstName}', '${lastName}')">
                                <i class="fas fa-comment"></i> Chat
                            </button>
                        </div>
                    </div>`
            };
            
            allFriends.push(friendItem);
        });

        renderFriendsList();

    } catch (error) {
        console.error("Error loading friends:", error);
        document.getElementById("friends").innerHTML = `<p class="text-center text-gray-500">Error loading friends</p>`;
    }
}

function renderFriendsList() {
    let container = document.getElementById("friends");
    if (allFriends.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500">No friends yet</p>`;
        return;
    }
    
    container.innerHTML = allFriends.map(friend => friend.html).join('');
}

window.addFriend = async (currentUserId, friendId, currentUserDocId, friendDocId) => {
    try {
        const friendRef = doc(db, 'users', friendDocId);
        await updateDoc(friendRef, {
            friendRequest: arrayUnion(currentUserId)
        });

        const myRef = doc(db, 'users', currentUserDocId);
        await updateDoc(myRef, {
            sentRequests: arrayUnion(friendId)
        });

        // Reload all data
        loadAllData(currentUserId);

    } catch (error) {
        console.error("Error adding friend:", error);
        alert("Error adding friend. Please try again.");
    }
}

window.cancelRequest = async (currentUserId, friendId, currentUserDocId, friendDocId) => {
    try {
        const friendRef = doc(db, 'users', friendDocId);
        await updateDoc(friendRef, {
            friendRequest: arrayRemove(currentUserId)
        });

        const myRef = doc(db, 'users', currentUserDocId);
        await updateDoc(myRef, {
            sentRequests: arrayRemove(friendId)
        });

        loadAllData(currentUserId);

    } catch (error) {
        console.error("Error canceling request:", error);
        alert("Error canceling request. Please try again.");
    }
}

window.acceptFriendRequestFromList = async (currentUserId, friendId, currentUserDocId, friendDocId) => {
    try {
        const myRef = doc(db, 'users', currentUserDocId);
        const friendRef = doc(db, 'users', friendDocId);

        // Add to friends list
        await updateDoc(myRef, {
            friends: arrayUnion(friendId),
            friendRequest: arrayRemove(friendId)
        });

        await updateDoc(friendRef, {
            friends: arrayUnion(currentUserId),
            sentRequests: arrayRemove(currentUserId)
        });

        loadAllData(currentUserId);

    } catch (error) {
        console.error("Error accepting friend request:", error);
        alert("Error accepting friend request. Please try again.");
    }
}

window.declineFriendRequest = async (currentUserId, friendId, currentUserDocId) => {
    try {
        const myRef = doc(db, 'users', currentUserDocId);

        await updateDoc(myRef, {
            friendRequest: arrayRemove(friendId)
        });

        loadAllData(currentUserId);

    } catch (error) {
        console.error("Error declining friend request:", error);
        alert("Error declining friend request. Please try again.");
    }
}

// Accept friend request from main list
window.acceptFriendRequest = async (currentUserId, friendId, currentUserDocId, friendDocId) => {
    try {
        const myRef = doc(db, 'users', currentUserDocId);
        const friendRef = doc(db, 'users', friendDocId);

        await updateDoc(myRef, {
            friends: arrayUnion(friendId),
            friendRequest: arrayRemove(friendId)
        });

        await updateDoc(friendRef, {
            friends: arrayUnion(currentUserId),
            sentRequests: arrayRemove(currentUserId)
        });

        loadAllData(currentUserId);

    } catch (error) {
        console.error("Error accepting friend request:", error);
        alert("Error accepting friend request. Please try again.");
    }
}

// Start chat with friend
window.startChat = (friendId, firstName, lastName) => {
    // Save friend info to localStorage for dashboard
    localStorage.setItem('currentChatFriend', JSON.stringify({
        id: friendId,
        firstName: firstName,
        lastName: lastName
    }));
    
    // Redirect to dashboard which should load the chat
    window.location.href = "./dashbord.html";
}

// Search functions
window.searchPeople = () => {
    const searchTerm = document.getElementById('searchPeople').value.toLowerCase();
    const chatList = document.getElementById('chatList');
    
    if (!searchTerm) {
        renderPeopleList();
        return;
    }
    
    const filtered = allPeople.filter(person => 
        person.firstName.toLowerCase().includes(searchTerm) || 
        person.lastName.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        chatList.innerHTML = `<p class="text-center text-gray-500">No users found</p>`;
    } else {
        chatList.innerHTML = filtered.map(person => person.html).join('');
    }
}

window.searchRequests = () => {
    const searchTerm = document.getElementById('searchRequests').value.toLowerCase();
    const container = document.getElementById('friendRequest');
    
    if (!searchTerm) {
        renderRequestsList();
        return;
    }
    
    const filtered = allRequests.filter(request => 
        request.firstName.toLowerCase().includes(searchTerm) || 
        request.lastName.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500">No requests found</p>`;
    } else {
        container.innerHTML = filtered.map(request => request.html).join('');
    }
}

window.searchFriends = () => {
    const searchTerm = document.getElementById('searchFriends').value.toLowerCase();
    const container = document.getElementById('friends');
    
    if (!searchTerm) {
        renderFriendsList();
        return;
    }
    
    const filtered = allFriends.filter(friend => 
        friend.firstName.toLowerCase().includes(searchTerm) || 
        friend.lastName.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500">No friends found</p>`;
    } else {
        container.innerHTML = filtered.map(friend => friend.html).join('');
    }
}