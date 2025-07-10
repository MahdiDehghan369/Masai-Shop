const express = require('express');
const router = express.Router()

const blogCtrl = require('./../controllers/blogCtrl');
const authMiddleware = require('./../middlewares/authMiddleware');
const isAdminMiddleware = require('./../middlewares/isAdminMiddleware');
const {uploadPhoto} = require("./../middlewares/uploadImages");

router.route("/").post(authMiddleware , isAdminMiddleware , blogCtrl.createBlog).get(blogCtrl.getAllBlogs)
router.route("/cover/:id").patch(authMiddleware , isAdminMiddleware, uploadPhoto.single("cover") , blogCtrl.addBlogCover).delete(authMiddleware , isAdminMiddleware , blogCtrl.removeBlogCover)
router.route("/like").patch(authMiddleware , blogCtrl.likeTheBlog);
router.route("/dislike").patch(authMiddleware , blogCtrl.disLikeTheBlog);
router.route("/:id").put(authMiddleware , isAdminMiddleware , blogCtrl.updateBlog).get(blogCtrl.getBlog).delete(authMiddleware , isAdminMiddleware , blogCtrl.removeBlog)


module.exports = router