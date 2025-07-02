const express = require('express');
const router = express.Router()
const authCtrl = require('../controllers/authCtrl');
const validateBody = require('./../middlewares/validateBody');
const registerValidator = require('./../validators/registerValidator');


router
  .route("/register")
  .post(validateBody(registerValidator), authCtrl.register);
router.route("/login").post(authCtrl.login);

router.route("/refresh-token").post(authCtrl.refreshToken)
router.route("/logout").post(authCtrl.logout)

module.exports = router