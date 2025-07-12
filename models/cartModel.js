const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true, 
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  color: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const cartModel = mongoose.model("Cart", cartSchema); 

module.exports = cartModel
