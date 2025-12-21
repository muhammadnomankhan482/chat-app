import {auth, onAuthStateChanged, signInWithEmailAndPassword } from "./config.js";

let email = document.getElementById("email");
let password = document.getElementById("password");

window.login = function (event) {
    event.preventDefault();

    window.login = function (event) {
        event.preventDefault();

        // const auth = getAuth();
        signInWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user);
                window.location.replace("./dashbord.html")
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });

    }

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