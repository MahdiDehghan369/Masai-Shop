const { isValidObjectId } = require("mongoose");
const ProductModel = require("./../models/productModel");
const UserModel = require("../models/userModel");
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res, next) => {
  try {

    console.log(req.files);
    let {
      title,
      slug,
      description,
      price,
      category,
      quantity,
      brand,
      color,
    } = req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const isProductExistsWithSlug = await ProductModel.findOne({ slug }).lean();

    if (isProductExistsWithSlug) {
      if (req.files) {
        req.files.forEach((file) => {
          const filePath = path.join(__dirname, `../public/images/products/${file.filename}`);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        })
      }
    }

    if (isProductExistsWithSlug) {
      return res.status(422).json({
        success: false,
        message: "A product with this slug already exists ❌",
      });
    }

    const imageUrls =
      req.files?.map((file) => `/images/products/${file.filename}`) || [];

    const newProduct = await ProductModel.create({
      title,
      slug,
      description,
      createdBy: req.user._id,
      price,
      category,
      quantity,
      brand,
      color,
      images: imageUrls,
    });

    return res.status(200).json({
      success: true,
      message: "Product created successfully ✅",
      product: newProduct,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.join(
          __dirname,
          `../public/images/products/${file.filename}`
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    next(error);
  }
};

exports.updateProdut = async(req, res , next) => {
try {

  const {id} = req.params

  if(!isValidObjectId(id)){
    return res.status(422).json({
      success: false,
      message: "Product Id is not valid ❌"
    })
  }

  const product = await ProductModel.findOne({_id: id}).lean()

  if(!product){
    return res.status(404).json({
      success: false,
      message: "Product not found ❌"
    })
  }

  let { title, slug, description, price, category, quantity, brand, color } =
    req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

  const isProductExistsWithSlug = await ProductModel.findOne({$and: [{slug} , {_id : {$ne : id}}]}).lean();

  if (isProductExistsWithSlug) {
    return res.status(422).json({
      success: false,
      message: "A product with this slug already exists ❌",
    });
  }

  const updatedProduct = await ProductModel.updateOne({_id:id},{
    title,
    slug,
    description,
    price,
    category,
    quantity,
    brand,
    color,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully ✅",
  });
} catch (error) {
  next(error);
}
}

exports.removeOneProduct = async(req, res , next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product Id is not valid ❌",
      });
    }

    const product = await ProductModel.findOneAndDelete({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    const imageUrls = product.images

    if(imageUrls){
      imageUrls.forEach((file) => {
        const filePath = path.join(
          __dirname,
          `../public${file}`
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed successfully ❌",
    });
  } catch (error) {
    next(error)
  }
}

exports.getOneProductInfo = async (req, res, next) => {
  try {
    let { slug } = req.params;

    slug = slug.trim().replace(" " , "-");

    const product = await ProductModel.findOne({ slug }, "-__v").populate("createdBy" , "firstname , lastname , email").populate("ratings.postedBy" , "firstname , lastname , _id").lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      color,
      search,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    }    

    if (color) {
      query.color = { $regex: new RegExp(`^${color}$`, "i") };
    }
    

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      query.quantity = { $gt: 0 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sortOption = {};
    sortOption[sortBy] = order === "asc" ? 1 : -1;

    const products = await ProductModel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await ProductModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};


exports.addToWishlist = async(req, res, next) => {
  try {
    const userId = req.user.id 
    const {productId} = req.body

    if(!isValidObjectId(productId)){
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌"
      })  
    }

    const product = await ProductModel.findOne({_id: productId})

    if(!product){
      return res.status(404).json({
        success: false,
        message: "Product not found ❌"
      })
    }

    const user = await UserModel.findOne({_id: userId})

    const alredyExists = user.wishlist.includes(productId)

    let message = ""

    if(alredyExists){
      await UserModel.updateOne({_id: userId} , {
        $pull: {wishlist: productId}
      })

      message = "Product removed from whishlist 👍"
    }else{
      await UserModel.updateOne(
        { _id: userId },
        {
          $push: { wishlist: productId },
        }
      );
       message = "Product added to whishlist 👍";
    }

    return res.status(200).json({
      success: true,
      message
    })

  } catch (error) {
    next(error)
  }
}

exports.rating = async(req , res , next) => {
  try {
    const userId = req.user.id;
    const { productId , star, comment } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.postedBy.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      product.ratings[existingRatingIndex].star = star;
      product.ratings[existingRatingIndex].comment = comment;
      product.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      product.ratings.push({
        postedBy: userId,
        star,
        comment
      });
      product.totalRating += 1;
    }

    let totalStars = 0;
    for (const rating of product.ratings) {
      totalStars += rating.star;
    }
    product.averageRating = totalStars / product.ratings.length;


    await product.save();

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully ✅",
      product
    });


  } catch (error) {
    next(error)
  }
}