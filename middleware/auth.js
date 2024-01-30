const { sign, verify } = require("jsonwebtoken");

exports.token = async (user) => {
  const accessToken = sign(
    { userName: user.userName, id: user.id },
    "qwertyuiopasdfghjklzxcvbnm"
  );
  return accessToken;
};

exports.validateToken = async (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) return res.redirect("/ssm/mca/sessionExpired");

  try {
    const validToken = verify(accessToken, "qwertyuiopasdfghjklzxcvbnm");
    if (validToken) {
      return next();
    }
  } catch (err) {
    res.send(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("access-token");
  res.redirect("/");
};

module.exports = exports;
