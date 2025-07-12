const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
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
  color: {
    type: String, 
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      province: String,
      city: String,
      addressLine: String,
      postalCode: String,
      plaque: String,
      unit: String,
    },

    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      default: "online",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    trackingCode: {type: String , default: ""},

    totalPrice: {
      type: Number,
      required: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel
