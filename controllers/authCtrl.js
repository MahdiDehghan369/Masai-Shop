const {
  generateAccessToken,
  generateRefreshToken,
} = require("../configs/jwtToken");
const UserModel = require("./../models/userModel");
const ResetPasswordOtpModel = require("./../models/passwordResetOtpModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateOtpCode = require('./../utils/generateOtpCode');
const sendOtpCode = require("./../configs/sendOtpCode");

exports.register = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const isEmailExists = await UserModel.findOne({ email });

    if (isEmailExists) {
      return res.status(409).json({
        success: false,
        message: "🚫 Email already exists. Please use a different one.",
      });
    }
    const createUser = await UserModel.create({
      firstname,
      lastname,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "🎉 Registration successful! Welcome aboard!",
      user: {
        id: createUser?._id,
        firstname: createUser?.firstname,
        lastname: createUser?.lastname,
        email: createUser?.email,
        role: createUser?.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const isUserExists = await UserModel.findOne({ email }, "-__v");

    if (isUserExists && (await isUserExists.comparePassword(password))) {

      if(isUserExists.isBlock === true){
        return res.status(403).json({
          success: false,
          message: "You can not login because you exist in block list 🤦‍♂️🤦‍♀️"
        })
      }
      const refreshToken = await generateRefreshToken(isUserExists?._id);

      await UserModel.updateOne(
        { _id: isUserExists._id },
        {
          refreshToken: {
            token: refreshToken,
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
          },
        }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
        sameSite: "Strict",
      });

      return res.status(200).json({
        success: true,
        user: {
          id: isUserExists?._id,
          firstname: isUserExists?.firstname,
          lastname: isUserExists?.lastname,
          email: isUserExists?.email,
          role: isUserExists?.role,
          token: generateAccessToken(isUserExists?._id),
        },
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Password or Email is wrong 👎",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    }

    const user = await UserModel.findOne({
      "refreshToken.token": refreshToken,
    });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};


exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing in cookies ❌",
      });
    }

    const user = await UserModel.findOne({
      "refreshToken.token": refreshToken,
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token or user not found ⛔",
      });
    }

    if (user.refreshToken.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: "Refresh token has expired 🕒",
      });
    }

    const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    if (user._id.toString() !== decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Refresh token is invalid or user mismatch 🚫",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    const decodedNew = jwt.decode(newRefreshToken);
    user.refreshToken = {
      token: newRefreshToken,
      expiresAt: new Date(decodedNew.exp * 1000),
    };

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};


exports.requestResetPassword = async(req , res, next) => {
  try {
    const {email} = req.body

    const otpCode = generateOtpCode()

    const expiresAt = Date.now() + 5 * 60 * 1000;

    await ResetPasswordOtpModel.create({
      email,
      otpCode,
      expiresAt,
    })

    const sendEmail = await sendOtpCode(email , otpCode)


    res.status(201).json({
      message: "If this email is registered, an OTP has been sent.",
    });

  } catch (error) {
    next(error)
  }
}

exports.verifyOtpCode = async (req , res , next) => {
  try {
    const {otpCode , email} = req.body

    const getOtpCodeFromDb = await ResetPasswordOtpModel.findOne({
      email: email.toLowerCase(),
      otpCode,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    if(!getOtpCodeFromDb){
      return res.status(404).json({ message: "Invalid or expired OTP" });
    }

    if(getOtpCodeFromDb.isUsed === true){
      return res.status(409).json({ message: "OTP has already been used" });
    }

    if(new Date(getOtpCodeFromDb.expiresAt) < new Date()){
      return res.status(400).json({ message: "OTP has expired" });
    }

    if(getOtpCodeFromDb.otpCode !== otpCode){
      return res.status(422).json({ message: "Incorrect OTP" });
    }

    await ResetPasswordOtpModel.updateOne({$and : [{email} , {otpCode}]} , {isUsed: true})

    const token = jwt.sign(
      { email, purpose: "reset_password" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "5m",
      }
    );
    
        res.cookie("ResetPasswordToken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 5 * 60 * 1000,
        });
    
        return res.status(200).json({
          message: "OTP verified successfully",
          token, 
        });

  } catch (error) {
    next(error)
  }
}

exports.resetPassword = async (req , res , next) => {
  try {
    const {password} = req.body

    const resetPasswordToken = req.cookies?.ResetPasswordToken

    if(!resetPasswordToken){

    }

    let decoded;
    try {
      decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (decoded.purpose !== "reset_password") {
      return res.status(403).json({ message: "Invalid token purpose" });
    }

    const hashedPassword = await bcrypt.hash(password , 12)
    await UserModel.findOneAndUpdate({email: decoded.email} , {password: hashedPassword})

    res.clearCookie("ResetPasswordToken");

    return res.status(200).json({
      message: "Password has been reset successfully.",
    });

  } catch (error) {
    next(error)
  }
}