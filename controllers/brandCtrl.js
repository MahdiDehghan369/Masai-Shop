const { isValidObjectId } = require('mongoose');
const BrandModel = require('./../models/brandModel');


exports.createBrand  = async(req , res , next) => {
    try {
        let {title , slug} = req.body

        slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

        const isbrandExistsWithSlug = await BrandModel.findOne({slug})

        if(isbrandExistsWithSlug){
            return res.status(400).json({
              success: false,
              message: "Brand with this slug already exists",
            });
        }

        const brand = await BrandModel.create({title , slug})

        return res.status(200).json({
            success: true,
            message: "Brand created successfully ✅",
            brand
        })

    } catch (error) {
        next(error)
    }
}

exports.updateBrand = async(req , res , next) => {
    try {
        const {id} = req.params

        if(!isValidObjectId(id)){
            return res.status(422).json({
                success: false,
                message: "Brand ID is not valid ❌"
            })
        }

        const brand = await BrandModel.findOne({_id: id})

        if(!brand){
            return res.status(404).json({
                success: false,
                message: "Brand not found ❌"
            })
        }

        let {title , slug} = req.body

        slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

        const isbrandExistsWithSlug = await BrandModel.findOne({ slug  ,  _id: {$ne : id}});

        if (isbrandExistsWithSlug) {
          return res.status(400).json({
            success: false,
            message: "Brand with this slug already exists",
          });
        }

        brand.title = title
        brand.slug = slug

        await brand.save()

        return res.status(200).json({
            success: true,
            message: "Brand updated successfully ✅"
        })

    } catch (error) {
        next(error)
    }
}

exports.removeBrand = async(req , res , next) => {
    try {
        const {id} = req.params

        if(!isValidObjectId(id)){
            return res.status(422).json({
                success: false,
                message: "Brand ID is not valid ❌"
            })
        }

        const brand = await BrandModel.findOne({_id: id})

        if(!brand){
            return res.status(404).json({
                success: false,
                message: "Brand not found ❌"
            })
        }

        await BrandModel.deleteOne({_id: id})

        return res.status(200).json({
            success: true,
            message: "Brand removed successfully ✅"
        })
    } catch (error) {
        next(error)
    }
}

exports.getBrandInfo = async(req, res, next) => {
    try {
        const {id} = req.params

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Brand ID is not valid ❌",
          });
        }

        const brand = await BrandModel.findOne({ _id: id } , "-__v").lean();

        if (!brand) {
          return res.status(404).json({
            success: false,
            message: "Brand not found ❌",
          });
        }

        return res.status(200).json({
            success: true,
            brand
        })

    } catch (error) {
        next(error)
    }
}

exports.getAllPublishedBrands = async(req,res,next) => {
    try {
        const brands = await BrandModel.find({isPublished: true} , "-__v")

        return res.status(200).json({
            success: true,
            brands
        })
    } catch (error) {
        next(error)
    }
}

exports.getAllUnPublishedBrands = async (req, res, next) => {
  try {
    const brands = await BrandModel.find({ isPublished: false }, "-__v");

    return res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeStatusOfPublished = async(req , res ,next) => {
    try {
        const { id } = req.body;

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Brand ID is not valid ❌",
          });
        }

        let brand = await BrandModel.findOne({ _id: id });

        if (!brand) {
          return res.status(404).json({
            success: false,
            message: "Brand not found ❌",
          });
        }

        if(brand.isPublished){
            brand.isPublished = false
        }else{
            brand.isPublished = true
        }

        await brand.save()

        return res.status(200).json({
            success: true,
            brand
        })
    } catch (error) {
        next(error)
    }
}