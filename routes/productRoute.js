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
  .post(authMiddleware, isAdminMiddleware, productCtrl.createProduct)
  .get(productCtrl.getAllProducts);


  router.route("/whishlist").put(authMiddleware, productCtrl.addToWishlist);
  router.route("/rating").post(authMiddleware, productCtrl.rating);

router
  .route("/:id/cover")
  .delete(authMiddleware, isAdminMiddleware, productCtrl.removeCover)
  .put(
    authMiddleware,
    isAdminMiddleware,
    uploadPhoto.single("cover"),
    productCtrl.addProductCover
  );

  
router
  .route("/:id/gallery")
  .delete(
    authMiddleware,
    isAdminMiddleware,
    productCtrl.removeAImageFromGallery
  ).put(authMiddleware , isAdminMiddleware , uploadPhoto.array("images" , 10) , productImgResize , productCtrl.addProductGallery)


router
  .route("/:id")
  .delete(authMiddleware, isAdminMiddleware, productCtrl.removeOneProduct)
  .put(authMiddleware, isAdminMiddleware, productCtrl.updateProdut);


router.route("/:slug").get(productCtrl.getOneProductInfo);

module.exports = router;
