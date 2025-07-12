const { isValidObjectId } = require("mongoose");
const UserModel = require("./../models/userModel");
const ProductModel = require("./../models/productModel");
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

exports.changeUserRole = async(req , res, next) => {
  try {

    const {userId} = req.params

    if(!isValidObjectId(userId)){
      return res.status(422).json({
        success: false,
        message: "User ID is not valid ❌"
      })
    }

    const user = await UserModel.findOne({_id: userId})

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    if(user.role === "admin"){
      user.role = "user"
    }else{
      user.role = "admin";
    }
    

    await user.save()

    return res.status(200).json({
      success: false,
      message: "Role changed successfully ✅",
    });
    
  } catch (error) {
    next(error)
  }
}

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

exports.getWishlist = async(req , res, next) => {
  try {

    const {id} = req.user

    const user = await UserModel.findOne({ _id: id })
      .populate({
        path: "wishlist",
        populate: [
          {
            path: "createdBy",
            select: "firstname lastname",
          },
          {
            path: "ratings.postedBy",
            select: "firstname lastname",
          },
        ],
      })
      .lean();

    return res.status(200).json({
      success: true,
      whislist: user.wishlist
    })

  } catch (error) {
    next(error)
  }
}

exports.addProdutToRecentlyViewed = async(req , res, next) => {
  try {
    const {productId} = req.body
    const userId = req.user.id

    if(!isValidObjectId(productId)){
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid"
      })
    }

    const product = await ProductModel.findOne({_id: productId})

    if(!product){
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    const user = await UserModel.find({_id: userId})

    const index = user.recentlyViewed.findIndex(
      (item) => item.product.toString() === productId
    );


      if (index !== -1) {
        user.recentlyViewed[productExistsinRecentlyViewed].viewedAt =
          Date.now();
      }else{
        user.recentlyViewed.unshift({
          product: productId,
          viewedAt: new Date(),
        })

        if (user.recentlyViewed.length > 10) {
          user.recentlyViewed = user.recentlyViewed.slice(0, 10);
        }
      }

    await user.save()

    return res.status(200).json({
      success: true,
      message: "Product added to recently viewed ✅",
    });

  } catch (error) {
    next(error)
  }
} 

exports.getRecentlyViewedProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).populate("recentlyViewed.product");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      products: user.recentlyViewed,
    });
  } catch (error) {
    next(error);
  }
};