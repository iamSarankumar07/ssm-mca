const admin = require('firebase-admin');
const Image = require("../models/imageModel");

require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URL,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "gs://college-656fa.appspot.com",
// });

const bucket = admin.storage().bucket();

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    let fileName = req?.body?.title ?? req.file.originalname;
    let description = req?.body?.description ?? "";

    const blob = bucket.file(`saran/${fileName}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.log("Error during upload:", err);
      res.status(500).send("Error uploading file.");
    });

    blobStream.on("finish", async () => {
      try {
        await blob.makePublic();
        const publicUrl = blob.publicUrl();
        let imageDBdata;
        if(publicUrl) {
          const image = new Image({
            title: fileName,
            description: description,
            imageUrl: publicUrl,
          });

          imageDBdata = await image.save();
          console.log("Image uploaded successfully...")
        }
        // res.status(200).json(imageDBdata);
        return res.send(
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
                <p>Image successfully uploaded...</p>
                <div class="button-container">
                  <button type="button" onclick="redirect()">Continue</button>
                </div>
              </div>
            </div>
          
            <script>
              function redirect() {
                window.location.href = "/ssm/mca/imageUpload";
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
      } catch (err) {
        console.log("Error in uploadImage:", err);
        res.status(500).send(
          '<script>alert("Error while uploading image!"); window.location="/ssm/mca/uploadImage";</script>'
        );
      }
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.getImagesFromFireBase = async (req, res) => {
  try {
    let folderName = 'saran';
    let [files] = await bucket.getFiles({
      prefix: `${folderName}/`,
    });

    if (files.length === 0) {
      return res.status(404).json({ message: "No images found in the folder" });
    }

    let imageUrls = files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);

    res.status(200).json({
      message: "Images fetched successfully",
      images: imageUrls,
    });
  } catch (err) {
    console.log("Error fetching images:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getImagesFromDB = async (req, res) => {
  try {
    let images = await Image.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: images
    });
  } catch (err) {
    console.log("error in getImagesFromDB: " + err)
  }
};



module.exports = exports;
