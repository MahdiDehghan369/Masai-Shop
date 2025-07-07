const { isValidObjectId } = require("mongoose");
const UserModel = require("./../models/userModel");
const coupenModel = require("./../models/coupenModel");
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find({}, "-password -__v").lean();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "User id is not valid 👎",
      });
    }

    const user = await UserModel.findOne(
      { _id: id },
      "-password -__v -refreshToken"
    ).populate("wishlist");

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found 👎",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "User id is not valid 👎",
      });
    }

    const isUserExists = await UserModel.findOneAndDelete({ _id: id }).lean();

    if (!isUserExists) {
      return res.status(404).json({
        success: false,
        message: "User not found 👎",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "User removed successfully ✅",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateOneUser = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const isUserExists = await UserModel.findOne({_id}).lean()


    if(!isUserExists){
      return res.status(404).json({
        success: false,
        message: "User not found 👎",
      });
    }

    const { firstname, lastname, email } = req.body;
    const updateUser = await UserModel.updateOne(
      {_id},
      {
        firstname,
        lastname,
        email,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully ✅",
    });

  } catch (error) {
    next(error);
  }
};


exports.updateOneUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "User id is not valid 👎",
      });
    }

    const isUserExists = await UserModel.findOne({ _id: id }).lean();

    if (!isUserExists) {
      return res.status(404).json({
        success: false,
        message: "User not found 👎",
      });
    }

    const { firstname, lastname, email } = req.body;
    const updateUser = await UserModel.updateOne(
      { _id: id },
      {
        firstname,
        lastname,
        email,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const {id} = req.params

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "User id is not valid 👎",
      });
    }

    const isUserExists = await UserModel.findOne({_id: id})

    if(!isUserExists){
      return res.status(404).json({
        success: false,
        message: "User not found 👎"
      })
    }

    if(isUserExists.isBlock === true){
      return res.status(409).json({
        success: false,
        message: "User is already blocked ⚠️",
      });
    }

    await UserModel.updateOne({_id: id} , {
      isBlock : true
    })

    return res.status(200).json({
      success: true,
      message: "User blocked successfully ✅",
    });

  } catch (error) {
    next(error)
  }
}

exports.unBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "User id is not valid 👎",
      });
    }

    const isUserExists = await UserModel.findOne({ _id: id });

    if (!isUserExists) {
      return res.status(404).json({
        success: false,
        message: "User not found 👎",
      });
    }

    if(isUserExists.isBlock === false){
      return res.status(409).json({
        success: false,
        message: "User is already unblocked ⚠️",
      });
    }

    await UserModel.updateOne(
      { _id: id },
      {
        isBlock: false,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBlockUsers = async (req , res, next) => {
  try {
    const blockUsers = await UserModel.find({isBlock: true} , "-__v -password").lean()
    return res.status(200).json({
      success: true,
      users: blockUsers
    })
  } catch (error) {
    next(error)
  }
}


exports.changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const hashedPassword = await bcrypt.hash(password, 12);


    const user = await UserModel.findOneAndUpdate({ _id: userId } , {password: hashedPassword});

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found ❌",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};


