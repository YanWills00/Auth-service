const express = require('express');
const path = require('path');
const mysql = require('mysql');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());
app.use(sessions({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 60000 }
}));

let results;
let token;

app.get('/', (req, res) => {
    if (req.session.user) {
        res.session.destroy();
    }
    res.render('index');
});

app.post('/validateLogin', (req, res) => {

    db.query("SELECT * FROM accounts WHERE username=? OR email=?",
        [req.body.username, req.body.username],
        async (err, result) => {
            if (err || result.length == 0) {
                if (err) {
                    console.log(err);
                }
                res.json({ status: "failed", message: "Account doesn't exist or password misspelled !" });
            } else {

                if (result) {
                    const auth = await bcrypt.compare(req.body.password, result[0].password);

                    if (!auth) {
                        throw Error('invalid Password');
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

app.post('/validateInfo', async (req, res) => {

    let password;

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(req.body.password, salt);

    setTimeout(() => {

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
        console.log(userId);

        db.query("INSERT INTO accounts(ID, username, email, password, token) VALUES(?,?,?,?,?)",
            [userId, req.body.username, req.body.email, password, token],
            (err, result) => {
                if (err) {
                    console.log(err);
                    throw new Error('Unable to register user at the moment, please try again later');
                } else {
                    res.json({ status: "success", message: "Account successfully created" });
                }
            });

    }, 400)

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





