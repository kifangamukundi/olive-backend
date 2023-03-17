const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const ErrorResponse = require("../utils/errorResponse");
const Product = require("../models/Product");
const Category = require("../models/Category");

// @desc    Get all products
exports.getAllProductsRoute = async (req, res, next) => {

  try {
    const products = await Product.find();

    if (products.length === 0) {
      return next(new ErrorResponse("No products found", 404));
    }
    
    res.status(200).json({ sucess: true, message: "Success", data:{products: products} });
  } catch (err) {
    next(err);
  }
};

//  @desc Get a product by id
exports.getProductByIdRoute = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid product ID", 400));
  }

  try {
    const product = await Product.findById({_id:id});

    if (product == null) {
      return next(new ErrorResponse("No product found", 404));
    }

    res.status(200).json({ sucess: true, message: "Success", data:{product: product} });
  } catch (err) {
    next(err);
  }
};

//  @desc Get a product by id with all categories populated
exports.getProductByIdWithCategoriesPopulatedRoute = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid product ID", 400));
  }

  try {
    const product = await Product.findById({_id:id}).populate({
      path: 'categories',
      select: 'title slug _id'
    });

    if (product == null) {
      return next(new ErrorResponse("No product found", 404));
    }

    res.status(200).json({ sucess: true, message: "Success", data:{product: product} });
  } catch (err) {
    next(err);
  }
};

//  @desc Get a product by slug
exports.getProductBySlugRoute = async (req, res, next) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOne({slug});

    if (product == null) {
      return next(new ErrorResponse("No product found", 404));
    }

    res.status(200).json({ sucess: true, message: "Success", data:{product: product} });
  } catch (err) {
    next(err);
  }
};

// @desc Create a product
exports.createProductRoute =async (req, res, next) => {
  const { title, summary, slug, categories, content, defaultImage, otherImages} = req.body;

  try {
    const product = await Product.create({
      title,
      summary,
      slug,
      content,
      defaultImage,
      otherImages,
      categories,
    });
    
    await Promise.all(
      categories.map(categoryId =>
        Category.findByIdAndUpdate(
          categoryId,
          { $addToSet: { products: product._id } },
          { new: true }
        )
      )
    );

    res.status(201).json({ sucess: true, message: "Success", data:{product: product} });
  } catch (err) {
    next(err);
  }
};

// desc update a product
exports.updateProductRoute = async (req, res, next) => {
  const { id } = req.params;
  const { title, summary, categories, slug, content, defaultImage, otherImages } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorResponse("No product found", 404));
    }

    // Remove all current categories from the product
    await Category.updateMany({ _id: { $in: product.categories } }, { $pull: { products: id } });
    product.categories = [];

    // Update the product's properties
    if (title != null) {
      product.title = title;
    }

    if (summary != null) {
      product.summary = summary;
    }

    if (slug != null) {
      product.slug = slug;
    }

    if (content != null) {
      product.content = content;
    }
    
    if (defaultImage != null) {
      product.defaultImage = defaultImage;
    }

    if (otherImages != null) {
      product.otherImages = otherImages;
    }

    // Add new categories to the product
    if (categories != null) {
      product.categories = categories;
      await Promise.all(
        categories.map(categoryId =>
          Category.findByIdAndUpdate(
            categoryId,
            { $addToSet: { products: product._id } },
            { new: true }
          )
        )
      );
    }

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, message: "Success", data:{ product: updatedProduct } });
  } catch (err) {
    next(err);
  }
};


// // @desc Delete a product
exports.deleteProductRoute = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById({_id:id});

    if (product == null) {
      return next(new ErrorResponse("No product found", 404));
    }

    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    cloudinary.config(cloudinaryConfig);

    // Delete the default image from Cloudinary
    await cloudinary.uploader.destroy(product.defaultImage.public_id);

    // Delete the other images from Cloudinary
    for (const image of product.otherImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Remove product from categories
    const categoryIds = product.categories;
    await Promise.all(
      categoryIds.map((categoryId) =>
        Category.findByIdAndUpdate(categoryId, {
          $pull: { products: id },
        })
      )
    );

    // Remove the product from the database
    await product.remove();

    res.status(200).json({ sucess: true, message: "Success", data:{product: product} });
  } catch (err) {
    next(err);
  }
};
