const Image = require("../models/imageModel");
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
let bucket = require("../middleware/adminCredentials");
const moment = require('moment');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


exports.gallery = async (req, res) => {
  try {
    const apiUrl = "/v1/api/dashboard#gallery";
    res.render("gallery", { apiUrl });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.homeGallery = async (req, res) => {
  try {
    const apiUrl = "/";
    res.render("gallery", { apiUrl });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.uploadImageFireBase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    let fileName = req?.body?.title ?? req.file.originalname;
    let description = req?.body?.description ?? "";
    let date = moment().format('YYYY-MM-DD');

    const blob = bucket.file(`gallery/${fileName}`);
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
            date: date,
            type: "gallery",
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
                <p>Image successfully uploaded...</p>
                <div class="button-container">
                  <button type="button" onclick="redirect()">Continue</button>
                </div>
              </div>
            </div>
          
            <script>
              function redirect() {
                window.location.href = "/v1/api/imageUpload";
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
          '<script>alert("Error while uploading image!"); window.location="/v1/api/uploadImage";</script>'
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

exports.uploadImageCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    let fileName = req?.body?.title ?? req.file.originalname;
    let description = req?.body?.description ?? "";
    let date = moment().format('YYYY-MM-DD');

    cloudinary.uploader.upload_stream({
      public_id: fileName,
      resource_type: "auto",
      folder: 'college',
    }, async (error, result) => {
      if (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).send("Error uploading file to Cloudinary.");
      }

      console.log("Cloudinary Upload Success:", result);

      const image = new Image({
        title: fileName,
        description: description,
        date: date,
        type: "gallery",
        imageUrl: result.secure_url,
      });

      try {
        const imageDBdata = await image.save();
        console.log("Image saved successfully to DB:", imageDBdata);

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
                <p>Image successfully uploaded...</p>
                <div class="button-container">
                  <button type="button" onclick="redirect()">Continue</button>
                </div>
              </div>
            </div>
          
            <script>
              function redirect() {
                window.location.href = "/v1/api/imageUpload";
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
        console.error("Error saving to DB:", err);
        return res.status(500).send("Error saving image data to database.");
      }
    }).end(req.file.buffer);

  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.getAllImagesFromCloudinary = async (req, res) => {
  try {
    cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      max_results: 500,
    }, (error, result) => {
      if (error) {
        console.log("Cloudinary API Error:", error);
        return res.status(500).json({ message: "Error fetching images from Cloudinary" });
      }

      const images = result.resources.map(resource => resource.secure_url);

      res.status(200).json({
        message: "Images fetched successfully",
        images: images,
        total: result.total_count,
      });
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadImageSupabase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    let fileName = req?.body?.title ?? req.file.originalname;
    let description = req?.body?.description ?? "";

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      return res.status(500).send("Error uploading file to Supabase.");
    }

    const { publicUrl } = supabase.storage.from('images').getPublicUrl(data.path);

    const image = new Image({
      title: fileName,
      description: description,
      imageUrl: publicUrl,
    });

    try {
      const imageDBdata = await image.save();
      console.log("Image saved successfully to DB:", imageDBdata);

      return res.send(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Image Upload</title>
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
              <p>Image successfully uploaded...</p>
              <div class="button-container">
                <button type="button" onclick="redirect()">Continue</button>
              </div>
            </div>
          </div>

          <script>
            function redirect() {
              window.location.href = "/v1/api/imageUpload";
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
      console.error("Error saving to DB:", err);
      return res.status(500).send("Error saving image data to database.");
    }
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).send("Internal server error.");
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

exports.imageEditFirebase = async (req, res) => {
  try {
    let body = req.body;
    let imageId = req.params.imageId;

    let fileName = body?.title ?? req.file.originalname;
    let description = body?.description ?? "";
    let date = moment().format('YYYY-MM-DD');

    if (req.file) {
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
            await Image.findByIdAndUpdate(imageId, {
              title: fileName,
              description: description,
              imageUrl: publicUrl,
              date: date,
              createdAt: Date.now(),
            });
  
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
                  <p>Image Details Updated Successfully!</p>
                  <div class="button-container">
                    <button type="button" onclick="redirect()">Continue</button>
                  </div>
                </div>
              </div>
            
              <script>
                function redirect() {
                  window.location.href = "/v1/api/imageList";
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
            '<script>alert("Error while uploading image!"); window.location="/v1/api/imageList";</script>'
          );
        }
      });
      blobStream.end(req.file.buffer);
    } else {
      await Image.findByIdAndUpdate(imageId, {
        title: body.title,
        description: body.description,
        createdAt: Date.now(),
      });
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
              <p>Image Details Updated Successfully!</p>
              <div class="button-container">
                <button type="button" onclick="redirect()">Continue</button>
              </div>
            </div>
          </div>
        
          <script>
            function redirect() {
              window.location.href = "/v1/api/imageList";
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
    }
  } catch (err) {
    console.error(err);
    res.send("Error in image edit");
  }
};

exports.imageEditCloudinary = async (req, res) => {
  try {
    let body = req.body;
    let imageId = req.params.imageId;

    let fileName = body?.title ?? req.file.originalname;
    let description = body?.description ?? "";
    let date = moment().format('YYYY-MM-DD');

    if (req.file) {
      cloudinary.uploader.upload_stream({
        public_id: fileName,
        resource_type: "auto",
        folder: 'college',
      }, async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).send("Error uploading file to Cloudinary.");
        }
  
        console.log("Cloudinary Upload Success:", result);
  
        await Image.findByIdAndUpdate(imageId, {
          title: fileName,
          description: description,
          date: date,
          imageUrl: result.secure_url,
          createdAt: Date.now(),
        });
  
        try {
  
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
                  <p>Image successfully uploaded...</p>
                  <div class="button-container">
                    <button type="button" onclick="redirect()">Continue</button>
                  </div>
                </div>
              </div>
            
              <script>
                function redirect() {
                  window.location.href = "/v1/api/imageList";
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
          console.error("Error saving to DB:", err);
          return res.status(500).send("Error saving image data to database.");
        }
      }).end(req.file.buffer);
    } else {
      await Image.findByIdAndUpdate(imageId, {
        title: body.title,
        description: body.description,
        createdAt: Date.now(),
      });
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
              <p>Image Details Updated Successfully!</p>
              <div class="button-container">
                <button type="button" onclick="redirect()">Continue</button>
              </div>
            </div>
          </div>
        
          <script>
            function redirect() {
              window.location.href = "/v1/api/imageList";
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
    }
  } catch (err) {
    console.error(err);
    res.send("Error in image edit");
  }
};

exports.imageDelete = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const imageData = await Image.findByIdAndUpdate(imageId, { isDelete: true });
    res.redirect("/v1/api/imageList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.fetchImagesForGallery = async (req, res) => {
  try {
    let matchStr = {
      isDelete: false,
      type: "gallery"
    }

    if (req?.body?.category) matchStr.category = req.body.category;
    let imageData = await Image.find(matchStr).sort({ createdAt: -1 });
    res.json(imageData);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

exports.fetchNews = async (req, res) => {
  try {
    let imageData = await Image.find({ isDelete: false, type: "news" }).sort({ createdAt: -1 });
    res.json(imageData);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

exports.fetchEvents = async (req, res) => {
  try {
    let imageData = await Image.find({ isDelete: false, type: "events" }).sort({ createdAt: -1 });
    res.json(imageData);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

exports.newsAndEvents = async (req, res) => {
  try {
    res.render("newsAndEvents");
  } catch (err) {
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.imageDelete = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const imageData = await Image.findByIdAndUpdate(imageId, { isDelete: true });
    res.redirect("/v1/api/imageList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.getAdminNews = async (req, res) => {
  try {
    let imageData = await Image.find({ isDelete: false, type: "news" }).sort({ createdAt: -1 });
    res.json(imageData);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

exports.getAdminEvents = async (req, res) => {
  try {
    let imageData = await Image.find({ isDelete: false, type: "events" }).sort({ createdAt: -1 });
    res.json(imageData);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

exports.adminUploadGallery = async (req, res) => {
  try {
    let body = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    let fileName = req.body.title || req.file.originalname;
    let description = req.body.description || "";

    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "gallery",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject("Error uploading file to Cloudinary.");
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    let newsData = new Image({
      title: fileName,
      description: description,
      date: body.date,
      type: "gallery",
      category: body.category,
      imageUrl: cloudinaryResult.secure_url,
    });

    let savedData = await newsData.save();

    return res.json({
      success: true,
      message: "News uploaded successfully!",
      data: savedData,
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.adminUploadNews = async (req, res) => {
  try {
    let body = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    let fileName = req.body.title || req.file.originalname;
    let description = req.body.description || "";

    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "news",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject("Error uploading file to Cloudinary.");
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    let newsData = new Image({
      title: fileName,
      description: description,
      date: body.date,
      type: "news",
      status: body.status,
      imageUrl: cloudinaryResult.secure_url,
    });

    let savedData = await newsData.save();

    return res.json({
      success: true,
      message: "News uploaded successfully!",
      data: savedData,
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.adminUploadEvents = async (req, res) => {
  try {
    let body = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    let fileName = req.body.title || req.file.originalname;
    let description = req.body.description || "";

    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "events",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject("Error uploading file to Cloudinary.");
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    // Await Cloudinary Upload
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    // Save news data in the database
    let eventsData = new Image({
      title: fileName,
      description: description,
      date: body.date,
      type: "events",
      status: body.status,
      imageUrl: cloudinaryResult.secure_url,
    });

    let savedData = await eventsData.save();

    return res.json({
      success: true,
      message: "News uploaded successfully!",
      data: savedData,
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.adminUpdateNews = async (req, res) => {
  try {
    const newsId = req.params.id;

    const existingNews = await Image.findById(newsId);
    
    if (!existingNews) {
      return res.status(404).json({ 
        success: false, 
        message: "News item not found." 
      });
    }

    if (existingNews.type !== "news") {
      return res.status(400).json({ 
        success: false, 
        message: "This is not a news item." 
      });
    }

    existingNews.title = req.body.title || existingNews.title;
    existingNews.description = req.body.description || existingNews.description;
    existingNews.date = req.body.date || existingNews.date;
    existingNews.status = req.body.status || existingNews.status;
    
    existingNews.featured = req.body.featured === 'on' || req.body.featured === true;

    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: existingNews.title,
              resource_type: "auto",
              folder: "news",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error);
                return reject("Error uploading file to Cloudinary.");
              }
              resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });
      };

      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      existingNews.imageUrl = cloudinaryResult.secure_url;
    }

    const updatedNews = await existingNews.save();

    return res.json({
      success: true,
      message: "News updated successfully!",
      data: updatedNews,
    });

  } catch (err) {
    console.log("Error updating news:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.adminUpdateEvents = async (req, res) => {
  try {
    const eventId = req.params.id;

    const existingEvent = await Image.findById(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ 
        success: false, 
        message: "Event item not found." 
      });
    }

    if (existingEvent.type !== "events") {
      return res.status(400).json({ 
        success: false, 
        message: "This is not an event item." 
      });
    }

    existingEvent.title = req.body.title || existingEvent.title;
    existingEvent.description = req.body.description || existingEvent.description;
    existingEvent.date = req.body.date || existingEvent.date;
    existingEvent.status = req.body.status || existingEvent.status;
    
    existingEvent.registration = req.body.registration === 'on' || req.body.registration === true;
    
    if (existingEvent.registration && req.body.registrationUrl) {
      existingEvent.registrationUrl = req.body.registrationUrl;
    } else if (!existingEvent.registration) {
      existingEvent.registrationUrl = undefined;
    }

    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: existingEvent.title,
              resource_type: "auto",
              folder: "events",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error);
                return reject("Error uploading file to Cloudinary.");
              }
              resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });
      };

      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      existingEvent.imageUrl = cloudinaryResult.secure_url;
    }

    const updatedEvent = await existingEvent.save();

    return res.json({
      success: true,
      message: "Event updated successfully!",
      data: updatedEvent,
    });

  } catch (err) {
    console.log("Error updating event:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};


module.exports = exports;
