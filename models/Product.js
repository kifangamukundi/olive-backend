const mongoose = require("mongoose");
const Category = require("../models/Category");

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please a title"],
    unique: true,
  },
  slug: {
    type: String,
    required: [true, "Please a slug"],
    unique: true,
  },
  summary: {
    type: String,
    required: [true, "Please the summary"],
  },
  content: {
    type: Object,
    required: [true, "Please a content"],
  },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  defaultImage: {
    secure_url: {
      type: String,
      required: false,
      default: "default_secure_url"
    },
    public_id: {
      type: String,
      required: false,
      default: "default_public_id"
    }
  },
  otherImages: [{
    secure_url: {
      type: String,
      required: false
    },
    public_id: {
      type: String,
      required: false
    }
  }],
  
//   Other dynamic fields
},
{
    timestamps: true
});

// Before we delete a product
ProductSchema.pre('remove', async function(next) {
  const product = this;
  try {
    // Find all categories that contain this product
    const categories = await Category.find({ products: product._id });
    // Remove the product from each category's products array
    categories.forEach(category => {
      category.products.pull(product._id);
      category.save();
    });
    next();
  } catch (err) {
    next(err);
  }
});

// Add the product to the categories it's being added to
ProductSchema.post('save', async function(product) {
  try {
    if (product._processing || !product.categories) {
      // If the middleware is already processing this document or the product
      // doesn't have any categories, skip this middleware
      return;
    }
    product._processing = true;
    const categoriesToAddTo = product.categories;
    await Category.updateMany(
      { _id: { $in: categoriesToAddTo } },
      { $addToSet: { products: product._id } }
    );
  } catch (err) {
    console.log(err);
  }
});

// Remove the product from the categories it's being removed from
ProductSchema.pre('save', async function(next) {
  const product = this;
  try {
    if (product._processing || product.isNew || !product.isModified('categories')) {
      // If the middleware is already processing this document, the product is new,
      // or the categories field hasn't changed, skip this middleware
      return next();
    }
    product._processing = true;
    // Remove any duplicate categories from the categories array
    product.categories = [...new Set(product.categories)];
    const originalProduct = await product.constructor.findById(product._id);
    const categoriesToRemoveFrom = originalProduct.categories.filter(c => !product.categories.includes(c));
    await Category.updateMany(
      { _id: { $in: categoriesToRemoveFrom } },
      { $pull: { products: product._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});




const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
