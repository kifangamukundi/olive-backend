const mongoose = require('mongoose');
const ErrorResponse = require("../utils/errorResponse");
const Category = require("../models/Category");

// @desc    Get all categories
exports.getAllCategoriesRoute = async (req, res, next) => {

  try {
    const categories = await Category.find();

    if (categories.length === 0) {
      return next(new ErrorResponse("No Perks found", 404));
    }
    
    res.status(200).json({ sucess: true, message: "Success", data:{categories: categories} });
  } catch (err) {
    next(err);
  }
};

// @desc Create a category
exports.createCategoryRoute =async (req, res, next) => {
    const { title, slug } = req.body;
  
    try {
        // Check if category already exists
        const titleExists = await Category.findOne({ title });
        if (titleExists) {
          return next(new ErrorResponse("Category already exists", 409));
        }

      const slugExists = await Category.findOne({ slug });
      if (slugExists) {
        return next(new ErrorResponse("Category already exists", 409));
      }
      const category = await Category.create({
        title,
        slug,
      });
  
      await category.save();
  
      res.status(201).json({ sucess: true, message: "Success", data:{category: category} });
    } catch (err) {
      next(err);
    }
  };

  exports.deleteCategory = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const category = await Category.findById(id);
  
      if (!category) {
        return next(new ErrorResponse("Category not found", 404));
      }
  
      await category.remove();
  
      res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
  