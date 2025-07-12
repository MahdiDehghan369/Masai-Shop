const express = require('express');
const router = express.Router()

const addressCtrl = require('./../controllers/addressCtrl');

const authMiddleware = require("./../middlewares/authMiddleware");

router.route("/").post(authMiddleware , addressCtrl.createAddress).get(authMiddleware , addressCtrl.getAllAddresses)

router.route("/:id").delete(authMiddleware , addressCtrl.removeAddress).get(authMiddleware , addressCtrl.getAddressInfo).put(authMiddleware , addressCtrl.updateAddress)

router.route("/:id/set-default").patch(authMiddleware , addressCtrl.setDefaultAddress);

module.exports = router