import { auth, createUserWithEmailAndPassword, db, doc, onAuthStateChanged, setDoc } from "./config.js";

let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let email = document.getElementById("email");
let password = document.getElementById("password");

window.signup = function (event) {
    event.preventDefault();

    // const auth = getAuth();
    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log(user)
            try {
                await savingDataInDB(firstName.value, lastName.value, email.value, user.uid)
                firstName.value = ''
                lastName.value = ''
                email.value = ''
                password.value = ''
                // setTimeout(window.location.replace("./login.html"), 8000)
                // ...
            } catch(error){
                console.error("db error", error)
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });

}

function userChecking() {
    // const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            setTimeout(() => {
                window.location.href = "./dashbord.html"
            }, 8000);
            // ...
        } else {
            // User is signed out
            // ...
        }
    });
}

userChecking();

async function savingDataInDB(firstName, lastName, email, userId) {
    // Add a new document in collection "cities"
    console.log(firstName, lastName, email, userId)
    await setDoc(doc(db, "users", userId), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        userId: userId
    });
}