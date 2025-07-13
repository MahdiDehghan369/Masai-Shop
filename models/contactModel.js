const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "seen", "replied"],
      default: "pending",
    },
    answer: {
      type: String,
      default: "",
    },
    answerBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const contactModel = mongoose.model("Contact", contactSchema);
module.exports = contactModel;
