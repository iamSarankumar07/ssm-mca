const { sign, verify } = require("jsonwebtoken");

exports.token = async (user) => {
  const accessToken = sign(
    { email: user.email, id: user.id, name: user.fullName, staffId: user.staffId, role: "admin" },
    "qwertyuiopasdfghjklzxcvbnm"
  );
  return accessToken;
};

exports.sToken = async (student) => {
  const accessToken = sign(
    { studentId: student.studentId, id: student.id, name: student.name, year: student.year, course: student.course, role: "student" },
    "mnbvcxzlkjhgfdsapoiuytrewq"
  );
  return accessToken;
};

exports.fToken = async (student) => {
  const accessToken = sign(
    { studentId: student.studentId, id: student.id, name: student.name, year: student.year, course: student.course },
    "mnbvcxzlkjhgfdsapoiuytrewq"
  );
  return accessToken;
};

exports.validateToken = async (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) return res.redirect("/v1/api/sessionExpired");

  try {
    const validToken = verify(accessToken, "qwertyuiopasdfghjklzxcvbnm");
    if (validToken) {
      req.user = {
        email: validToken.email,
        id: validToken.id,
        name: validToken.name,
        staffId: validToken.staffId,
        role: validToken.role
      };
      return next();
    }
  } catch (err) {
    res.send('<script>alert("Not Authonticated"); window.location.href = "/";</script>');
    // console.log(err);
  }
};

exports.sValidateToken = async (req, res, next) => {
  const accessToken = req.cookies["access-token-student"];
  if (!accessToken) return res.redirect("/v1/api/sessionExpired");

  try {
    const validToken = verify(accessToken, "mnbvcxzlkjhgfdsapoiuytrewq");
    if (validToken) {
      req.student = {
        studentId: validToken.studentId,
        _id: validToken.id,
        name: validToken.name,
        year: validToken.year,
        course: validToken.course
      }
      return next();
    }
  } catch (err) {
    res.send('<script>alert("Not Authonticated"); window.location.href = "/";</script>');
    // console.log(err);
  }
};

exports.fValidateToken = async (req, res, next) => {
  const accessToken = req.cookies["access-token-faculty"];
  if (!accessToken) return res.redirect("/v1/api/sessionExpired");

  try {
    const validToken = verify(accessToken, "mnbvcxzlkjhgfdsapoiuytrewq");
    if (validToken) {
      req.student = {
        studentId: validToken.studentId,
        _id: validToken.id,
        name: validToken.name,
        year: validToken.year,
        course: validToken.course
      }
      return next();
    }
  } catch (err) {
    res.send('<script>alert("Not Authonticated"); window.location.href = "/";</script>');
    // console.log(err);
  }
};

exports.validateHeaderSignature = async (req, res, next) => {
  const signature = req.headers["signature"];
  const generateSignature = Buffer.from(req?.query?.studentId?.toString() || req?.body?.studentId).toString('base64');;

  if (signature !== generateSignature) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

exports.logout = (req, res) => {
  res.clearCookie("access-token");
  res.redirect("/v1/api/signin");
};

exports.slogout = (req, res) => {
  res.clearCookie("access-token-student");
  res.redirect("/v1/api/signin");
};

exports.flogout = (req, res) => {
  res.clearCookie("access-token-faculty");
  res.redirect("/v1/api/signin");
};

module.exports = exports;
