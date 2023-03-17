const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const multer = require('multer');
const Product = require("../models/Product");
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

// // Route for deleting an image by public ID
exports.imageDeletion = async (req, res, next) => {
  const { public_id } = req.body;

  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(cloudinaryConfig);

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);
    console.log(`Image ${public_id} deleted from Cloudinary`);

    // Find the product(s) referencing the deleted image
    const products = await Product.find({
      $or: [
        { 'defaultImage.public_id': public_id },
        { 'otherImages.public_id': public_id }
      ]
    });

    // Update the product(s) with the new image URLs
    await updateProductImages(products, public_id);

    // Return success response
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    // Return error response
    next(error);
  }
};

async function updateProductImages(products, public_id) {
  for (const product of products) {
    if (product.defaultImage.public_id === public_id) {
      console.log(`Removing deleted image from defaultImage field. Before: `, product.defaultImage);

      product.defaultImage = {
        secure_url: "default_secure_url",
        public_id: "default_public_id"
      };

      console.log(`After: `, product.defaultImage);
    }

    console.log(`Before: `, product.otherImages);

    product.otherImages = product.otherImages.filter(image => image.public_id !== public_id);

    console.log(`After: `, product.otherImages);

    await Product.updateOne({ _id: product._id }, { $set: { defaultImage: product.defaultImage, otherImages: product.otherImages } });
    console.log(`Product ${product._id} updated`);
  }
};