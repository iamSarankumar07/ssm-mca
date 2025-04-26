const studyMaterialModel = require("../models/studyMaterial");
const fs = require('fs');
const { google } = require('googleapis');
const mongoose = require('mongoose');


const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });



exports.getStudyMaterialUpload = async (req, res) => {
  let year = req.body.year;
  let course = req.body.course;
  res.render("uploadStudyMaterial", { year, course });
};

exports.uploadStudyMaterial = async (req, res) => {
  try {
    const { subjectCode, course, semester, year, subjectTitle } = req.body;
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const fileSizeInBytes = req.file.size;
    const fileSize = (fileSizeInBytes / (1024 * 1024)).toFixed(2) + " MB";

    const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream(req.file.path),
    };

    // Upload file to Google Drive
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    // Make file public
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const fileUrl = `https://drive.google.com/uc?id=${file.data.id}`;

    // Save details in MongoDB
    const newMaterial = new studyMaterialModel({
      subjectCode,
      subjectTitle,
      course,
      semester,
      year,
      fileUrl,
      fileSize,
      isDelete: false
    });
    await newMaterial.save();

    // Delete local file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Study material uploaded successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: true,
      message: "Failed to upload study material."
    });
  }
};

exports.viewStudyMaterials = async (req, res) => {
  const { year, course } = req.body;
  try {
    const materials = await studyMaterialModel.find({ year, course });

    let semesters;;

    if (course === "BCA") {
      semesters = [1, 2, 3, 4, 5, 6];
    } else if (course === "MCA") {
      semesters = [1, 2, 3, 4];
    } else {
      semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    }

    const formattedMaterials = materials.map((material) => ({
      id: material._id,
      subjectCode: material.subjectCode,
      subjectTitle: material.subjectTitle,
      semester: material.semester,
      fileUrl: material.fileUrl,
      description: material.description || "No description available",
      uploadDate: new Date(material.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }), 
      fileSize: material.fileSize,
      fileType: "PDF",
    }));

    const materialsBySemester = {};
    formattedMaterials.forEach((material) => {
      if (!materialsBySemester[material.semester]) {
        materialsBySemester[material.semester] = [];
      }
      materialsBySemester[material.semester].push(material);
    });

    res.render("viewStudyMaterial", {
      year,
      course,
      semesters,
      materials: formattedMaterials,
      materialsBySemester,
    });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    res.render("viewStudyMaterial", {
      year,
      course,
      semesters: [],
      materials: [],
      materialsBySemester: {},
    });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    let materialData = await studyMaterialModel.findById(req.params.id).lean();
    res.status(200).json(materialData);
  } catch (err) {
    console.log("Error in getMaterialById: " + err);
    res.status(500).json({})
  }
};

exports.updateStudyMaterial = async (req, res) => {
  try {
    const { subjectCode, course, semester, year, subjectTitle, materialId } = req.body;

    let updateData = { subjectCode, subjectTitle, course, semester, year };

    if (req.file) {
      const fileMetadata = {
        name: req.file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const fileSizeInBytes = req.file.size;
      const fileSize = (fileSizeInBytes / (1024 * 1024)).toFixed(2) + " MB";

      const media = {
        mimeType: "application/pdf",
        body: fs.createReadStream(req.file.path),
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });

      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      const fileUrl = `https://drive.google.com/uc?id=${file.data.id}`;
      
      updateData.fileUrl = fileUrl;
      updateData.fileSize = fileSize;

      fs.unlinkSync(req.file.path);
    }

    let updatedMaterial = await studyMaterialModel.findByIdAndUpdate(materialId, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: "Study material updated successfully."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update study material."
    });
  }
};

exports.newSubject = async (req, res) => {
  const body = req.body;
  const subject = SubjectModel({
    title: body.title,
    code: body.code,
    link: body.link,
    year: body.year,
  });
  try {
    const studyNotes = await studyMaterialModel.save();
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
              color: #28a745; 
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
              window.location.href = "/v1/api/subject";
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
    const user = await studyMaterialModel.findByIdAndUpdate(Id, { isDelete: true });
    res.redirect("/v1/api/subjectList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};
