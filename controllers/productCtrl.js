const ProductModel = require("./../models/productModel");

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

}

exports.removeOneProduct = async(req, res , next) => {
    
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

exports.getAllProducts = async(req, res , next) => {
    try {
        const getAllProducts = await ProductModel.find({}, "-__v").populate("createdBy" , "firstname , lastname , email")

        return res.status(200).json({
            success: true,
            products: getAllProducts
        })
    } catch (error) {
        next(error)
    }
}