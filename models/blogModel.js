const mongoose = require('mongoose');
const { ref } = require('yup');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
  numViews: {
    type: Number,
    default: 0,
    min: 0,
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  disLikes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  cover: {
    type: String,
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  }
} , {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});


const blogModel = mongoose.model("Blog" , blogSchema)

module.exports = blogModel