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
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();


    let loginBtn = document.getElementById('login');
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    loginBtn.disabled = true;

    let credentials = {
        username,
        password
    };
    console.log("submit", credentials)

    fetch('http://localhost:3000/validateLogin', {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        body: JSON.stringify(credentials)
    })
        .then(response => response.json())
        .then(data => {
            redirectPage(data);
        })
        .catch(error => console.log(error));
})



