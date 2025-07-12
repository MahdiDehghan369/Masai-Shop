const { isValidObjectId } = require("mongoose");
const AddressModel = require("./../models/addressModel");

exports.createAddress = async (req, res, next) => {
  try {
    let {
      fullName,
      phone,
      province,
      city,
      postalCode,
      addressLine,
      plaque,
      unit,
      isDefault,
    } = req.body;

    const userId = req.user.id;

    const addressCount = await AddressModel.find({ user: userId });

    if (addressCount.length === 0) {
      isDefault = true;
    }

    if (isDefault === true) {
      await AddressModel.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await AddressModel.create({
      user: userId,
      fullName,
      phone,
      province,
      city,
      postalCode,
      addressLine,
      plaque,
      unit,
      isDefault,
    });

    return res.status(200).json({
        success: true,
        message: "Address created successfully ✅",
        address
    })
    
  } catch (error) {
    next(error);
  }
};


exports.getAllAddresses = async(req , res , next) => {
    try {
        const userId = req?.user?.id

        const addresses = await AddressModel.find({user: userId}, "-__v").lean()

        return res.status(200).json({
            success: true,
            addresses
        })
    } catch (error) {
        next(error)
    }
}


exports.removeAddress = async(req , res, next) => {
    try {
        
        const {id} = req.params

        if(!isValidObjectId(id)){
            return res.status(422).json({
                success: false,
                message: "Address ID is not valid ❌"
            })
        }

        const address = await AddressModel.findOneAndDelete({_id: id})

        if(!address){
            return res.status(404).json({
                success: false,
                message: "Address not found 👎"
            })
        }

        return res.status(200).json({
          success: false,
          message: "Address removed successfully ✅",
        });

    } catch (error) {
        next(error)
    }
}


exports.getAddressInfo = async(req , res, next) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Address ID is not valid ❌",
          });
        }

        const address = await AddressModel.findOne({ _id: id });

        if (!address) {
          return res.status(404).json({
            success: false,
            message: "Address not found 👎",
          });
        }

        return res.status(200).json({
          success: false,
          address
        });
        
    } catch (error) {
        next(error)
    }
}


exports.updateAddress = async(req, res, next) => {
    try {
        
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Address ID is not valid ❌",
          });
        }

        const address = await AddressModel.findOne({ _id: id });

        if (!address) {
          return res.status(404).json({
            success: false,
            message: "Address not found 👎",
          });
        }

        let {
          fullName,
          phone,
          province,
          city,
          postalCode,
          addressLine,
          plaque,
          unit,
        } = req.body;


        await AddressModel.updateOne(
          { _id: id },
          {
            fullName,
            phone,
            province,
            city,
            postalCode,
            addressLine,
            plaque,
            unit,
          }
        );


        return res.status(200).json({
            success: true,
            message: "Address updated successfully ✅"
        })
        

    } catch (error) {
        next(error)
    }
}


exports.setDefaultAddress = async(req, res, next) => {
    try {
        
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Address ID is not valid ❌",
          });
        }

        const address = await AddressModel.findOne({ _id: id });

        if (!address) {
          return res.status(404).json({
            success: false,
            message: "Address not found 👎",
          });
        }

        address.isDefault = true

        const addresses = await AddressModel.updateMany({
          $and: [{ user: req?.user?.id } , {_id: {$ne: id}}],
        }, {
            isDefault: false
        });

        await address.save()

        return res.status(200).json({
            success: true,
            message: "Address set default successfully ✅"
        })



    } catch (error) {
        next(error)
    }
}