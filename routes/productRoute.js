const express = require("express");
const router = express.Router();

const productCtrl = require("./../controllers/productCtrl");
const authMiddleware = require("./../middlewares/authMiddleware");
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");

router
  .route("/")
  .post(authMiddleware, isAdminMiddleware, productCtrl.createProduct)
  .get(productCtrl.getAllProducts);

router
  .route("/:id")
  .delete(authMiddleware, isAdminMiddleware, productCtrl.removeOneProduct)
  .put(authMiddleware, isAdminMiddleware, productCtrl.updateProdut);

router.route("/:slug").get(productCtrl.getOneProductInfo);

module.exports = router;
