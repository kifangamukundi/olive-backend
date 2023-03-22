const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const multer = require('multer');
const Room = require("../models/Room");
const ErrorResponse = require("../utils/errorResponse");

const upload = multer();

exports.imageUpload = async (req, res, next) => {
  try {
    upload.array('files')(req, res, async (err) => {
      if (err) {
        return next(new ErrorResponse("Error uploading files", 400));
      }
      
      if (!req.files) {
        return next(new ErrorResponse("No files passed", 400));
      }
      
      const cloudinaryConfig = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      };
      
      cloudinary.config(cloudinaryConfig);

      const streamUploads = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      const results = await Promise.all(streamUploads);
      res.send(results);
    });
  } catch (error) {
    next(error);
  }
};

exports.imageDeletion = async (req, res, next) => {
  const { public_id } = req.body;

  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(cloudinaryConfig);

    const result = await cloudinary.uploader.destroy(public_id);
    console.log(`Image ${public_id} deleted from Cloudinary`);

    const rooms = await Room.find({
      $or: [
        { 'defaultImage.public_id': public_id },
        { 'otherImages.public_id': public_id }
      ]
    });

    await updateRoomImages(rooms, public_id);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

async function updateRoomImages(rooms, public_id) {
  for (const room of rooms) {
    if (room.defaultImage.public_id === public_id) {
      room.defaultImage = {
        secure_url: "default_secure_url",
        public_id: "default_public_id"
      };
    }

    room.otherImages = room.otherImages.filter(image => image.public_id !== public_id);

    await Room.updateOne({ _id: room._id }, { $set: { defaultImage: room.defaultImage, otherImages: room.otherImages } });
  }
};