const express = require('express');
const path = require('path');
const mysql = require('mysql');
const eValidator = require('email-validator');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "password",
    database: "Authentication"
});

const app = express();

app.set('view engine', 'ejs');
app.listen(3000, () => {
    console.log("listening on port 3000");
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'views/scripts')));
app.use(express.urlencoded({ extended: true }));

let results;
let token;

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/signIn', (req, res) => {

    db.query("SELECT * FROM accounts WHERE username=? OR email=?",
        [req.body.username, req.body.username],
        async (err, result) => {
            if (err || result.length == 0) {
                if (err) {
                    console.log(err);
                }
                res.json({ status: "failed", message: "Account doesn't exist or password misspelled !" });
                return;
            } else {

                if (result) {
                    const auth = await bcrypt.compare(req.body.password, result[0].password);

                    if (!auth) {
                        res.json({ status: "failed", message: "Account doesn't exist or password misspelled !" });
                        return;
                    }
                }


                res.cookie('jwt', result[0].token)
                    .status(200)
                    .json({ status: "success", message: "User successfully logged in", username: result[0].username, token: result[0].token });

                results = {
                    ID: result[0].ID,
                    username: result[0].username,
                    email: result[0].email,
                    token: result[0].token
                }

                console.log(results);
            }
        });
});

app.get('/login', (req, res) => {
    res.render('login', { results });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/signUp', (req, res) => {

    let userExist = 0;

    db.query("SELECT username, email FROM accounts",
        (err, result) => {
            for (let i = 0; i < result.length; i++) {
                if (result[i].username == req.body.username || result[i].email == req.body.email) {
                    userExist = 1;
                }
            }
        }
    );

    setTimeout(async () => {

        if (userExist == 0) {

            if (!eValidator.validate(req.body.email)) {
                res.json({ status: "failed", message: "Invalid Email !!!" });
                return;
            }

            let password;

            const salt = await bcrypt.genSalt();
            password = await bcrypt.hash(req.body.password, salt);

            try {
                token = jwt.sign(
                    { user: req.body.username, email: password },
                    "secretkeyjwt",
                    { expiresIn: 3600 }
                );

            } catch (err) {

                console.log(err);
            }

            let userId = uuid.v4();

            db.query("INSERT INTO accounts(ID, username, email, password, token) VALUES(?,?,?,?,?)",
                [userId, req.body.username, req.body.email, password, token],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        throw new Error('Unable to register user at the moment, please try again later');
                    } else {
                        res.json({ status: "success", message: "Account successfully created" });
                        return;
                    }
                }
            );
        } else {
            res.json({ status: "failed", message: "Account with credentials already used !!!" });
            return;
        }
    }, 500)



});

app.get('/usernames', (req, res) => {
    db.query("SELECT ID, username, token FROM accounts",
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                res.json(results);
            }
        });
});





