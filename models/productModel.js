const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    quantity: {
      type: Number,
      min: 0,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
    },
    ratings: [
      {
        star: { type: Number, min: 1, max: 5 },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.model("Product" , productSchema);

module.exports = productModel;
