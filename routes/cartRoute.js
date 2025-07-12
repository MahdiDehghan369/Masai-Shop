const express = require('express');
const router = express.Router()

const cartCtrl = require('./../controllers/cartCtrl');
const authMiddleware = require("./../middlewares/authMiddleware");

router.route("/").get(authMiddleware, cartCtrl.getCart);
router.route("/add").post(authMiddleware , cartCtrl.addToCart)
router.route("/update").patch(authMiddleware, cartCtrl.updateCartItem);
router.route("/remove").delete(authMiddleware, cartCtrl.removeFromCart);
router.route("/clear").delete(authMiddleware, cartCtrl.clearCart);
router.route("/apply-coupen").post(authMiddleware, cartCtrl.applyCoupen);

module.exports = router