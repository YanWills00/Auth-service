let validEmail, validUsername, validPassword;

// check if user exist 
async function userExist(username) {

    const users = await fetch('http://localhost:3000/usernames')
        .then(res => res.json())
        .catch(error => alert("Erreur : " + error));

    let j = 0;

    for (let i = 0; i < users.length; i++) {

        if (users[i].username === username) {
            alert("User Already exist !!!");
            j++;
            break;
        }

    }

    console.log(j);

    if (j === 0) {

        validUsername = username;
    } else {

        validUsername = null;
    }

    return validUsername;


}

// check email
function isEmailValid(email) {
    let emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,6}$/);

    if (emailRegex.test(email)) {
        validEmail = email;
        return validEmail;
    } else {
        return null;
    }
}

// check usernmae
function isUsernameValid(username) {
    let usernameRegex = new RegExp(/^(?=.{4,10}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/);

    if (usernameRegex.test(username)) {
        userExist(username);
        return validUsername;
    } else {
        return null;
    }
}

// check password
function isPasswordValid(password) {
    let passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d.\-_`~()@$!%*?&^]{8,}/);

    if (passwordRegex.test(password)) {
        validPassword = password;
        return validPassword;
    } else {
        return null;
    }
}

// check data
function checkData(e) {
    e.preventDefault();
    let submitBtn = document.getElementById('submit');

    submitBtn.disabled = true;

    let email = document.getElementById('email').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    const errMsgBox = document.getElementById('err-msg');
    const valMsgBox = document.getElementById('val-msg');

    isEmailValid(email);
    isUsernameValid(username);
    isPasswordValid(password);

    setTimeout(async () => {

        if (!validEmail || !validUsername || !validPassword) {

            let span = document.createElement('span');
            span.innerText = "Enter Informations correctly";
            errMsgBox.appendChild(span);
            setTimeout(() => {
                errMsgBox.removeChild(span);
            }, 3000);

        } else {

            let infos = {
                username: validUsername,
                email: validEmail,
                password: validPassword
            };

            await fetch('http://localhost:3000/validateInfo', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                },
                body: JSON.stringify(infos)
            })
                .then(res => { return res.json(); })
                .catch(error => console.log(error));

            let span = document.createElement('span');
            span.innerText = "Account Created Successfully ";
            valMsgBox.appendChild(span);
            setTimeout(() => {
                valMsgBox.removeChild(span);
            }, 3000);

            document.getElementById('registerForm').reset();
        }

        submitBtn.disabled = false;
    }, 400);

}

document.getElementById('submit').addEventListener('click', checkData);