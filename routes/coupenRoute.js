const express = require("express");

const router = express.Router();

const authMiddleware = require("./../middlewares/authMiddleware");
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");

const coupenCtrl = require("./../controllers/coupenCtrl");

router
  .route("/")
  .post(authMiddleware, isAdminMiddleware, coupenCtrl.createCoupen)
  .get(authMiddleware, isAdminMiddleware, coupenCtrl.getAllCoupens);

  router
    .route("/my-used")
    .get(authMiddleware, coupenCtrl.getAllCoupensUsedByUser);

router
  .route("/:id")
  .get(authMiddleware, isAdminMiddleware, coupenCtrl.getCoupenInfo)
  .delete(authMiddleware, isAdminMiddleware, coupenCtrl.removeCoupen)
  .put(authMiddleware, isAdminMiddleware, coupenCtrl.updateCoupen);

router.route("/change-status").patch(authMiddleware , isAdminMiddleware , coupenCtrl.changeStatus)



router.route("/:id/users").get(authMiddleware , isAdminMiddleware , coupenCtrl.getUsersUsedCoupens)



module.exports = router;
