const express = require('express');
const router = express.Router()

const contactCtrl = require('./../controllers/contactCtrl');

const authMiddleware = require('./../middlewares/authMiddleware');
const isAdminMiddleware = require("./../middlewares/isAdminMiddleware");

router.route("/").post(contactCtrl.sendMessage)
router.route("/get-all").get(authMiddleware , isAdminMiddleware , contactCtrl.getAllContacts)
router.route("/:id/answer").post(authMiddleware , isAdminMiddleware , contactCtrl.answer)
router.route("/:id").get(authMiddleware , isAdminMiddleware , contactCtrl.getContactInfo).delete(authMiddleware , isAdminMiddleware , contactCtrl.removeContact);

module.exports = router