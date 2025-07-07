const express = require('express');
const router = express.Router()

const brandCtrl = require('./../controllers/brandCtrl');

const authMiddleware = require('./../middlewares/authMiddleware');
const isAdminMiddleware = require('./../middlewares/isAdminMiddleware');


router
  .route("/")
  .post(authMiddleware, isAdminMiddleware, brandCtrl.createBrand)

router.route("/published").get(brandCtrl.getAllPublishedBrands);
router.route("/unpublished").get(authMiddleware , isAdminMiddleware ,brandCtrl.getAllUnPublishedBrands);

router
  .route("/:id")
  .put(authMiddleware, isAdminMiddleware, brandCtrl.updateBrand)
  .delete(authMiddleware, isAdminMiddleware, brandCtrl.removeBrand)
  .get(brandCtrl.getBrandInfo)

router
  .route("/change-status")
  .patch(authMiddleware, isAdminMiddleware, brandCtrl.changeStatusOfPublished);

module.exports = router
