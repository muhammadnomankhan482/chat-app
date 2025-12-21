import { auth, collection, db, getDocs, onAuthStateChanged, query, signOut, where } from "./config.js";

function userChecking() {
    // const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            // ...
            loadUsers(uid);
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

async function loadUsers(userId) {
    const currentUser = query(collection(db, "users"), where("userId", "==", userId));
    const currentUserSnapshot = await getDocs(currentUser);
    const currentUserData = currentUserSnapshot.docs[0].data();
    document.getElementById("user-avatar").innerHTML = `${currentUserData.firstName[0]}${currentUserData.lastName[0]}`;
    document.getElementById("user-name").innerHTML = currentUserData.firstName + " " + currentUserData.lastName;

    const q = query(collection(db, "users"), where("userId", "!=", userId));

    const querySnapshot = await getDocs(q);
    let chatList = document.getElementById("chatList");
    querySnapshot.forEach((doc) => {
        const userData = doc.data()
        chatList.innerHTML += `<div class="chat-item">
                    <div class="chat-avatar">${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}</div>
                    <div class="chat-info">
                        <div class="chat-name">${userData.firstName} ${userData.lastName}</div>
                        <div class="last-message">Thanks for helping with the project!</div>
                    </div>
                    <div class="chat-meta">
                        <div class="chat-time">Yesterday</div>
                    </div>
                </div>`

    });

}