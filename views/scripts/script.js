// document.getElementById('login').addEventListener('click', sendLogin);
//  redirect to login page 
async function redirectPage(response) {
    const tokens = await fetch("http://localhost:3000/usernames")
        .then(res => res.json())
        .catch(error => alert("Erreur : " + error));

    const cookie = document.cookie.split("=")[1];

    setTimeout(() => {

        tokens.forEach(token => {
            if (token.username == response.username) {
                if (cookie != token.token) {
                    alert("Token is compromised !!!")
                } else {
                    location.href = "http://localhost:3000/login";
                }
            }
        });
    }, 200)


}


// send login 
let loginForm = document.getElementById('loginForm');
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();


    let loginBtn = document.getElementById('login');
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let errMsgBox = document.getElementById('err-msg');
    let serverMsg;

    loginBtn.disabled = true;

    let credentials = {
        username,
        password
    };

    await fetch('http://localhost:3000/signIn', {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        body: JSON.stringify(credentials)
    })
        .then(res => res.json())
        .then(data => {
            redirectPage(data);
            serverMsg = data;
        })
        .catch(error => console.log(error));

    if (serverMsg.status == "failed") {
        let span = document.createElement('span');
        span.innerText = serverMsg.message;
        errMsgBox.appendChild(span);

        setTimeout(() => {
            errMsgBox.removeChild(span);
        }, 2000);
    }
})

// /^(CE|LT|AD|EN|ES|NO|NW|OU|SU|SW|CD|CA|CMD|IT)([\d]{3,4})([A-Z]{1,2})?$/gm