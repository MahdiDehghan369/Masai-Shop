const mongoose = require('mongoose');

const resetOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otpCode: {
        type: String,
        required: true,
        min: 6,
        max: 6
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        requird: true
    }
}, {
    timestamps: true
})



const resetOtpModel = mongoose.model("ResetOtp" , resetOtpSchema)

module.exports = resetOtpModel