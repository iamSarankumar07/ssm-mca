const { sign, verify } = require("jsonwebtoken");

exports.token = async (user) => {
  const accessToken = sign(
    { email: user.email, id: user.id, name: user.name, staffId: user.staffId },
    "qwertyuiopasdfghjklzxcvbnm"
  );
  return accessToken;
};

exports.sToken = async (student) => {
  const accessToken = sign(
    { studentId: student.studentId, id: student.id, name: student.name },
    "mnbvcxzlkjhgfdsapoiuytrewq"
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
    res.send('<script>alert("Not Authonticated"); window.location.href = "/";</script>');
    // console.log(err);
  }
};

exports.sValidateToken = async (req, res, next) => {
  const accessToken = req.cookies["access-token-student"];
  if (!accessToken) return res.redirect("/ssm/mca/sessionExpired");

  try {
    const validToken = verify(accessToken, "mnbvcxzlkjhgfdsapoiuytrewq");
    if (validToken) {
      return next();
    }
  } catch (err) {
    res.send('<script>alert("Not Authonticated"); window.location.href = "/";</script>');
    // console.log(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("access-token");
  res.redirect("/");
};

exports.slogout = (req, res) => {
  res.clearCookie("access-token-student");
  res.redirect("/");
};

module.exports = exports;
