const {
  generateAccessToken,
  generateRefreshToken,
} = require("../configs/jwtToken");
const UserModel = require("./../models/userModel");
const jwt = require("jsonwebtoken");

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