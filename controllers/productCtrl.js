const { isValidObjectId } = require("mongoose");
const ProductModel = require("./../models/productModel");
const { $where, findOneAndDelete } = require("../models/userModel");

exports.createProduct = async (req, res, next) => {
  try {
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

    slug = slug.trim().replace(" " , "-")

    const isProductExistsWithSlug = await ProductModel.findOne({ slug }).lean();

    if (isProductExistsWithSlug) {
      return res.status(422).json({
        success: false,
        message: "A product with this slug already exists ❌",
      });
    }

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
    });

    return res.status(200).json({
      success: true,
      message: "Product created successfully ✅",
      product: newProduct,
    });
  } catch (error) {
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

  slug = slug.trim().replace(" ", "-");

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

    const product = await ProductModel.findOne({ slug }, "-__v").populate("createdBy" , "firstname , lastname , email").lean();

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