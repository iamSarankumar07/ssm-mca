const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const app = express();
require("./config/mongo");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "view");
app.set("views", viewPath);

app.use(express.static("images"));
app.use(bodyParser.json());

hbs.registerHelper('eq', function(v1, v2) {
  return v1 === v2;
});

hbs.registerHelper('inc', function(value, options) {
  return parseInt(value) + 1;
});

app.get("/", (req, res) => {
  res.render("main");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/studentHome", (req, res) => {
  res.render("studentHome");
});

app.use("/ssm/mca", require("./routes/index"));

/* app.use((req, res) => {
  res.status(404).render("404");
}); */

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`PORT CONNECTED TO ${PORT}...`);
});
