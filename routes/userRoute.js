const express = require("express");
const router = express.Router();

const userCtrl = require("./../controllers/userCtrl");
const authMiddleware = require("./../middlewares/authMiddleware");
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");

router
.route("/all-users")
.get(authMiddleware, isAdminMiddleware, userCtrl.getAllUsers);


router.route("/edit").put(authMiddleware, userCtrl.updateOneUser);
router.route("/change-password").patch(authMiddleware , userCtrl.changePassword)

router.route("/all-block-users").get(authMiddleware , isAdminMiddleware , userCtrl.getAllBlockUsers)
router.route("/block/:id").patch(authMiddleware , isAdminMiddleware , userCtrl.blockUser)
router.route("/unblock/:id").patch(authMiddleware , isAdminMiddleware , userCtrl.unBlockUser)
router.route("/wishlist/:id").get(authMiddleware , userCtrl.getWishlist)
router.route("/:userId/change-role").patch(authMiddleware , isAdminMiddleware , userCtrl.changeUserRole)
router
  .route("/recently-viewed")
  .post(authMiddleware, userCtrl.addProdutToRecentlyViewed)
  .get(authMiddleware, userCtrl.getRecentlyViewedProducts);
router
  .route("/:id")
  .get(userCtrl.getOneUser)
  .delete(authMiddleware, isAdminMiddleware, userCtrl.removeOneUser)
  .put(authMiddleware, isAdminMiddleware, userCtrl.updateOneUserByAdmin);





module.exports = router;
