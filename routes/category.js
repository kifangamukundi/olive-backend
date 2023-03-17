const express = require("express");
const router = express.Router();
const { createCategoryRoute, getAllCategoriesRoute } = require("../controllers/category");
const { protect, onlyAdmin } = require("../middleware/auth");

router.route("/").get(getAllCategoriesRoute);
router.route("/").post(onlyAdmin, createCategoryRoute);

module.exports = router;