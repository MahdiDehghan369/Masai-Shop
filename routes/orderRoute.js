const express = require("express");
const router = express.Router();

const orderCtrl = require("./../controllers/orderCtrl");
const authMiddleware = require("./../middlewares/authMiddleware");
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");

router
  .route("/")
  .post(authMiddleware, orderCtrl.createOrder)
  .get(authMiddleware, orderCtrl.getMyOrders);

router
  .route("/get-all")
  .get(authMiddleware, isAdminMiddleware, orderCtrl.getAllOrders);

router
  .route("/:id/order-status")
  .patch(authMiddleware, isAdminMiddleware, orderCtrl.updateOrderStatus);

router
  .route("/:id/payment-status")
  .patch(authMiddleware, isAdminMiddleware, orderCtrl.updatePaymentStatus);

router
  .route("/:id/tracking-code")
  .patch(authMiddleware, isAdminMiddleware, orderCtrl.updateTrackingCode);

router.route("/:id").get(authMiddleware, orderCtrl.getOrderInfo);

module.exports = router;
