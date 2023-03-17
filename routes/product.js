const express = require("express");
const router = express.Router();
const { getAllProductsRoute, 
    getProductByIdRoute, 
    getProductBySlugRoute, 
    createProductRoute, 
    updateProductRoute,
    getProductByIdWithCategoriesPopulatedRoute,
    deleteProductRoute } = require("../controllers/product");
const { protect, onlyAdmin } = require("../middleware/auth");

router.route("/").get(getAllProductsRoute);
router.route("/:id").get(getProductByIdRoute);
router.route("/with-categories/:id").get(getProductByIdWithCategoriesPopulatedRoute);
router.route("/slug/:slug").get(getProductBySlugRoute);
router.route("/").post(onlyAdmin, createProductRoute);
router.route("/:id").patch(onlyAdmin, updateProductRoute);
router.route("/:id").delete(onlyAdmin, deleteProductRoute);

module.exports = router;