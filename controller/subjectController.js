const SubjectModel = require("../models/subjectModel");

exports.newSubject = async (req, res) => {
  const body = req.body;
  const subject = SubjectModel({
    title: body.title,
    code: body.code,
    link: body.link,
    year: body.year,
  });
  try {
    const studyNotes = await subject.save();
    res.send(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
        
            .modal {
              display: flex;
              align-items: center;
              justify-content: center;
              position: fixed;
              z-index: 1000;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: rgba(0, 0, 0, 0.6);
            }
        
            .modal-content {
              background-color: #fefefe;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 10px;
              width: 80%;
              max-width: 400px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
        
            p {
              margin: 0 0 20px;
              font-size: 18px;
              font-weight: bold;
              color: #28a745; /* Green color */
              text-align: center;
            }
        
            .button-container {
              display: flex;
              justify-content: center;
              width: 100%;
            }
        
            button[type="button"] {
              background-color: #3d6ef5ff;
              color: #f2f2f2;
              font-weight: bold;
              padding: 8px 14px;
              border: none;
              font-size: 13px;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s;
            }
        
            button[type="button"]:hover {
              background-color: #f2f2f2;
              color: #3d6ef5ff;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div id="myModal" class="modal">
            <div class="modal-content">
              <p>Uploaded Successfully!</p>
              <div class="button-container">
                <button type="button" onclick="redirect()">Continue</button>
              </div>
            </div>
          </div>
        
          <script>
            function redirect() {
              window.location.href = "/ssm/mca/subject";
            }
        
            window.onload = function() {
              var modal = document.getElementById("myModal");
        
              modal.style.display = "flex";
        
              window.onclick = function(event) {
                if (event.target == modal) {
                  modal.style.display = "none";
                  redirect();
                }
              }
            }
          </script>
        </body>
        </html>
        `
       );
    console.log(studyNotes);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const Id = req.params.userId;
    const user = await SubjectModel.findByIdAndUpdate(Id, { isDelete: true });
    res.redirect("/ssm/mca/subjectList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};
