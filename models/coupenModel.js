const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.isValid = function (userId) {
  const now = new Date();
  const notExpired = this.expiresAt > now;

  if (!notExpired) {
    return { message: "Coupen expired 😊" };
  }

  const underLimit = this.usedCount < this.usageLimit;

  if (!underLimit) {
    return { message: "Coupen expired 😊" };
  }
  const UsedIt = this.usedBy.user.includes(userId);

  if (UsedIt) {
    return { message: "You already use it 😊" };
  }
};

const CouponModel = mongoose.model("Coupon", couponSchema);

module.exports = CouponModel;
