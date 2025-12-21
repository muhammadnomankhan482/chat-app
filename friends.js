import { auth, collection, db, getDocs, onAuthStateChanged, query, signOut, where, doc, updateDoc, arrayUnion, arrayRemove } from "./config.js";

function userChecking() {
    // const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            // ...
            loadUsersREquests(uid);
        } else {
            window.location.replace("./login.html")
            // User is signed out
            // ...
        }
    });
}

userChecking();

window.signout = function () {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}

async function loadUsersREquests(currentUserId) {
    const currentUser = query(collection(db, "users"), where("userId", "==", currentUserId));
    const currentUserSnapshot = await getDocs(currentUser);
    const currentUserData = currentUserSnapshot.docs[0].data();
    document.getElementById("user-avatar").innerHTML = `${currentUserData.firstName[0]}${currentUserData.lastName[0]}`;
    document.getElementById("user-name").innerHTML = currentUserData.firstName + " " + currentUserData.lastName;

    const q = query(collection(db, "users"), where("userId", "!=", currentUserId));

    const querySnapshot = await getDocs(q);
    let chatList = document.getElementById("chatList");
    querySnapshot.forEach((doc) => {
        const userData = doc.data()
        const {userId} = userData;

        let buttonText, buttonFunction;

        buttonText = "Add Friend";
        buttonFunction = `addFriend('${currentUserId}','${userId}')`;


        chatList.innerHTML += `<div class="chat-item">
                    <div class="chat-avatar">${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}</div>
                    <div class="chat-info">
                        <div class="chat-name">${userData.firstName} ${userData.lastName}</div>
                    </div>
                    <div class="user-info">
                         <button class="logout-btn" onClick ="${buttonFunction}" id="btn-${userId}">
                             ${buttonText}
                         </button>
                     </div>
                </div>`

    });

}

window.addFriend = async (currentUserId, friendId) => {
    try {
        console.log(currentUserId, friendId)

        const friendRef = doc(db, 'users', friendId);
        await updateDoc(friendRef, {
            friendRequest: arrayUnion(currentUserId)
        });

        const myRef = doc(db, 'users', currentUserId);
        await updateDoc(myRef, {
            sentRequests: arrayUnion(friendId)
        });

        updateButtonToCancel(currentUserId, friendId);

    } catch (error) {
        console.log("Error adding friend:", error);
    }
}

window.deleteFriend = async (currentUserId, friendId) => {
    try {
        const myRef = doc(db, "users", currentUserId);

        // Remove friend from friendRequest array
        await updateDoc(myRef, {
            friendRequest: arrayRemove(friendId)
        });

        // Refresh the friend requests list
        getFriendRequests(currentUserId);

    } catch (error) {
        console.log("Error in deleteFriend: ", error)
    }
}

function updateButtonToCancel(currentUserId, friendId) {
    const button = document.getElementById(`btn-${friendId}`);
    if (button) {
        button.textContent = "Cancel Request";
        // button.className = "px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition";
        button.onclick = function() { cancelRequest(currentUserId, friendId); };
    }
}

window.cancelRequest = async (currentUserId, friendId) => {
    try {
        const friendRef = doc(db, 'users', friendId);
        await updateDoc(friendRef, {
            friendRequest: arrayRemove(currentUserId)
        });

        const myRef = doc(db, 'users', currentUserId);
        await updateDoc(myRef, {
            sentRequests: arrayRemove(friendId)
        });

        updateButtonToAdd(currentUserId, friendId);

    } catch (error) {
        console.log("Error canceling request:", error);
    }
}

function updateButtonToAdd(currentUserId, friendId) {
    const button = document.getElementById(`btn-${friendId}`);
    if (button) {
        button.textContent = "Add Friend";
        // button.className = "px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition";
        button.onclick = function() { addFriend(currentUserId, friendId); };
    }
}