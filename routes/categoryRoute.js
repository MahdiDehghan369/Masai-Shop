const express = require('express');
const router = express.Router()

const categoryCtrl = require('./../controllers/categoryCtrl');

const authMiddleware = require('./../middlewares/authMiddleware');
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");

router.route("/").post(authMiddleware , isAdminMiddleware , categoryCtrl.createCategory).get(categoryCtrl.getAllCategory)

router.route("/:id").put(authMiddleware , isAdminMiddleware , categoryCtrl.updateCategory).delete(authMiddleware , isAdminMiddleware , categoryCtrl.removeCategory).get(categoryCtrl.getCategoryInfo)

module.exports = router