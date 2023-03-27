const express = require("express");
const router = express.Router();
const { createCategoryRoute, getAllCategoriesRoute, deleteCategory } = require("../controllers/category");
const { onlyAdmin } = require("../middleware/auth");

router.route("/").get(getAllCategoriesRoute);
router.route("/").post(onlyAdmin, createCategoryRoute);
router.route("/:id").delete(onlyAdmin, deleteCategory);

module.exports = router;