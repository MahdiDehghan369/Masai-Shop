const express = require("express");
const router = express.Router();

const productCtrl = require("./../controllers/productCtrl");
const authMiddleware = require("./../middlewares/authMiddleware");
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("./../middlewares/uploadImages");

router
  .route("/")
  .post(authMiddleware, isAdminMiddleware,  uploadPhoto.array("images" , 10) , productImgResize ,productCtrl.createProduct)
  .get(productCtrl.getAllProducts);


  router.route("/whishlist").put(authMiddleware, productCtrl.addToWishlist);
  router.route("/rating").post(authMiddleware, productCtrl.rating);


router
  .route("/:id")
  .delete(authMiddleware, isAdminMiddleware, productCtrl.removeOneProduct)
  .put(authMiddleware, isAdminMiddleware, productCtrl.updateProdut);


router.route("/:slug").get(productCtrl.getOneProductInfo);

module.exports = router;
