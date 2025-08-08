const express = require("express");
const app = express();
const authenticationController = require("../middleware/auth");
const alumniNetworkController = require("../controller/alumniNetworkController");
const path = require("path");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get(
  "/alumni/network",
  authenticationController.sValidateToken,
  alumniNetworkController.alumniNetwork
);

app.get(
  "/alumni/profile/:alumniId",
  authenticationController.sValidateToken,
  alumniNetworkController.alumniNetworkDetails
);

app.get("/alumni/list",
    authenticationController.sValidateToken, 
    alumniNetworkController.getAlumniList
);

app.get("/alumni/network/stats",
    authenticationController.sValidateToken, 
    alumniNetworkController.getNetworkStats
);

app.get("/alumni/connections",
    authenticationController.sValidateToken, 
    alumniNetworkController.getConnections
);

app.get("/alumni/requests",
    authenticationController.sValidateToken, 
    alumniNetworkController.getConnectionRequests
);

app.post("/alumni/connect",
    authenticationController.sValidateToken, 
    alumniNetworkController.sendConnectionRequest
);

app.post("/alumni/accept",
    authenticationController.sValidateToken, 
    alumniNetworkController.acceptConnectionRequest
);

app.post("/alumni/decline",
    authenticationController.sValidateToken, 
    alumniNetworkController.declineConnectionRequest
);

module.exports = app;