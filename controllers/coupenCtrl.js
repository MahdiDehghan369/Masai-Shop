const { isValidObjectId } = require("mongoose");
const coupenModel = require("./../models/coupenModel");



exports.createCoupen = async (req, res, next) => {
  try {
    const { code, type, value, usageLimit, expiresAt } = req.body;

    const isCodeExists = await coupenModel.findOne({ code });

    if (isCodeExists) {
      return res.status(400).json({
        success: false,
        message: "Coupen with this code already exists ❌",
      });
    }

    const coupen = await coupenModel.create({
      code,
      type,
      value,
      usageLimit,
      expiresAt,
      createdBy: req?.user?.id,
    });

    return res.status(200).json({
      success: true,
      message: "Coupen created successfully ✅",
      coupen,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCoupens = async (req, res, next) => {
  try {

    const { type, active} = req.query;

    let query = {};

    if (type) {
      query.type = type;
    }

    if(active) {
      query.isActive = active
    }



    const coupens = await coupenModel
      .find({ ...query }, "-__v")
      .populate("createdBy", "firstname , lastname")
      .lean();

    return res.status(200).json({
      success: true,
      coupens,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCoupenInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(422)
        .json({ success: false, message: "Coupen ID is not valid ❌" });
    }

    const coupen = await coupenModel
      .findOne({ _id: id }, "-__v")
      .populate("createdBy", "firstname , lastname");

    return res.status(200).json({
      success: true,
      coupen,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeCoupen = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(422)
        .json({ success: false, message: "Coupen ID is not valid ❌" });
    }

    const coupen = await coupenModel.findOneAndDelete({ _id: id }, "-__v");

    if (!coupen) {
      return res.status(200).json({
        success: false,
        message: "Coupen not found 👎",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupen removed successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupen = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(422)
        .json({ success: false, message: "Coupen ID is not valid ❌" });
    }

    const coupen = await coupenModel.findOne({ _id: id });

    if (!coupen) {
      return res.status(200).json({
        success: false,
        message: "Coupen not found 👎",
      });
    }

    const { code, type, value, usageLimit, expiresAt } = req.body;

    const isCodeExists = await coupenModel.findOne({
      $and: [{ code }, { _id: { $ne: id } }],
    });

    if (isCodeExists) {
      return res.status(400).json({
        success: false,
        message: "Coupen with this code already exists ❌",
      });
    }

    coupen.code = code;
    coupen.type = type;
    coupen.value = value;
    coupen.usageLimite = usageLimit;
    coupen.expiresAt = expiresAt;

    await coupen.save();

    return res.status(200).json({
      success: true,
      message: "Coupen created successfully ✅",
      coupen,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { coupenId } = req.body;

    if (!isValidObjectId(coupenId)) {
      return res
        .status(422)
        .json({ success: false, message: "Coupen ID is not valid ❌" });
    }

    const coupen = await coupenModel.findOne({ _id: coupenId });

    if (!coupen) {
      return res.status(200).json({
        success: false,
        message: "Coupen not found 👎",
      });
    }

    const isActive = coupen.isActive;

    let message;

    if (isActive) {
      coupen.isActive = false;
      message = "Coupen disactive 👎";
    } else {
      coupen.isActive = true;
      message = "Coupen active 👍";
    }

    await coupen.save();

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsersUsedCoupens = async(req , res , next) => {
  try {

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(422)
        .json({ success: false, message: "Coupen ID is not valid ❌" });
    }

    const coupen = await coupenModel.findOne({ _id: id }).populate("usedBy.user" , "firstname , lastname , email , _id");

    if (!coupen) {
      return res.status(200).json({
        success: false,
        message: "Coupen not found 👎",
      });
    }


    const usedCoupens = coupen.usedBy
    
    return res.status(200).json({
      success: true,
      users: usedCoupens
    })
    
  } catch (error) {
    next(error)
  }
}

exports.getAllCoupensUsedByUser = async(req , res, next) => {
  try {

    let {id} = req?.user


    const coupensUsedByUser = await coupenModel.find(
      {
        "usedBy.user": id,
      },
      "code type value expiresAt createdBy"
    ).populate("createdBy" , "firstname , lastname");

    return res.status(200).json({
      success: true,
      coupens: coupensUsedByUser
    })
    
    


  } catch (error) {
    next(error)
  }
}