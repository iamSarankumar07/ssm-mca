const { verify } = require("jsonwebtoken");
const Message = require("../models/messageModel");

exports.getChatroom = async (req, res) => {
  try {
    const accessToken = req.cookies["access-token-student"];
    const decoded = verify(accessToken, "mnbvcxzlkjhgfdsapoiuytrewq");

    res.render("chatroom", { username: decoded.name });
  } catch (err) {
    res.redirect("/v1/api/signin");
  }
};

module.exports = exports;