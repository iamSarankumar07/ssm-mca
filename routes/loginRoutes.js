const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const loginController = require("../controller/loginController");
const authFile = require("../middleware/auth");
const app = express();
app.use(cookieParser());

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get('/login', (req, res)=>{
    res.render('login')
});

app.get('/signup', (req, res)=>{
    res.render('signup')
});

app.post('/signup', loginController.signup);

app.post('/login', loginController.login);

app.post('/otp', loginController.otp);

app.get('/logout', authFile.logout);




module.exports = app;