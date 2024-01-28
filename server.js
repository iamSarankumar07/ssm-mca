const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
require("./config/mongo");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// app.set("view engine", "hbs");
// const viewPath = path.join(__dirname, "view");
// app.set("views", viewPath);

app.use(bodyParser.json());

app.use("/ssm/mca", require("./routes/index"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`PORT CONNECTED TO ${PORT}...`);
});
