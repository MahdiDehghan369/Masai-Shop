const { isValidObjectId } = require("mongoose");
const ProductModel = require("./../models/productModel");
const UserModel = require("../models/userModel");
const CategoryModel = require("../models/categoryModel");
const BrandModel = require("../models/brandModel");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

exports.createProduct = async (req, res, next) => {
  try {
    let { title, slug, description, price, category, quantity, brand, color } =
      req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const isProductExistsWithSlug = await ProductModel.findOne({ slug }).lean();

    if (isProductExistsWithSlug) {
      return res.status(422).json({
        success: false,
        message: "A product with this slug already exists ❌",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(422).json({
        success: false,
        message: "Category ID is not valid",
      });
    }

    const existsCategory = await CategoryModel.findOne({
      _id: category,
      type: "product",
    });

    if (!existsCategory) {
      return res.status(404).json({
        success: false,
        message: "Category Not Found",
      });
    }


   if(brand){
     if (!isValidObjectId(brand)) {
       return res.status(422).json({
         success: false,
         message: "Brand ID is not valid",
       });
     }

     const existsBrand = await BrandModel.findOne({
       _id: brand,
       isPublished: true
     });

     if (!existsBrand) {
       return res.status(404).json({
         success: false,
         message: "Brand Not Found",
       });
     }
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

exports.updateProdut = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product Id is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    let { title, slug, description, price, category, quantity, brand, color } =
      req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const isProductExistsWithSlug = await ProductModel.findOne({
      $and: [{ slug }, { _id: { $ne: id } }],
    }).lean();

    if (isProductExistsWithSlug) {
      return res.status(422).json({
        success: false,
        message: "A product with this slug already exists ❌",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(422).json({
        success: false,
        message: "Category ID is not valid",
      });
    }

    const existsCategory = await CategoryModel.findOne({
      _id: category,
      type: "product",
    });

    if (!existsCategory) {
      return res.status(404).json({
        success: false,
        message: "Category Not Found",
      });
    }

    if (brand) {
      if (!isValidObjectId(brand)) {
        return res.status(422).json({
          success: false,
          message: "Brand ID is not valid",
        });
      }

      const existsBrand = await BrandModel.findOne({
        _id: brand,
        isPublished: true,
      });

      if (!existsBrand) {
        return res.status(404).json({
          success: false,
          message: "Brand Not Found",
        });
      }
    }

    const updatedProduct = await ProductModel.updateOne(
      { _id: id },
      {
        title,
        slug,
        description,
        price,
        category,
        quantity,
        brand,
        color,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};

exports.removeOneProduct = async (req, res, next) => {
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

    const imageUrls = product.images;

    if (imageUrls) {
      imageUrls.forEach((file) => {
        const filePath = path.join(__dirname, `../public${file}`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed successfully ❌",
    });
  } catch (error) {
    next(error);
  }
};

exports.getOneProductInfo = async (req, res, next) => {
  try {
    let { slug } = req.params;

    slug = slug.trim().replace(" ", "-");

    const product = await ProductModel.findOne(
      { slug, statusProduct: "published" },
      "-__v"
    )
      .populate("createdBy", "firstname , lastname , email")
      .populate("ratings.postedBy", "firstname , lastname , _id")
      .populate("category")
      .lean();

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

    query.statusProduct = "published";

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
      .populate("category")
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

exports.getAllProductForAdmin = async (req, res, next) => {
  const {
    category,
    brand,
    color,
    inStock,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 10,
    statusProduct,
  } = req.query;

  const query = {};

  if (brand) {
    query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
  }

  if (statusProduct) {
    query.statusProduct = statusProduct;
  }

  if (color) {
    query.color = { $regex: new RegExp(`^${color}$`, "i") };
  }

  if (category) {
    query.category = category;
  }

  if (inStock === "true") {
    query.quantity = { $gt: 0 };
  } else if (inStock === "false") {
    query.quantity = 0;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const sortOption = {};
  sortOption[sortBy] = order === "asc" ? 1 : -1;

  const products = await ProductModel.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .populate("category")
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
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({
      _id: productId,
      statusProduct: "published",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    const user = await UserModel.findOne({ _id: userId });

    const alredyExists = user.wishlist.includes(productId);

    let message = "";

    if (alredyExists) {
      await UserModel.updateOne(
        { _id: userId },
        {
          $pull: { wishlist: productId },
        }
      );

      message = "Product removed from whishlist 👍";
    } else {
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
      message,
    });
  } catch (error) {
    next(error);
  }
};

exports.rating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, star, comment } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({
      _id: productId,
      statusProduct: "published",
    });

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
        comment,
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
      product,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeCover = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    if (product.cover) {
      const coverPath = path.join(__dirname, "..", "public", product.cover);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }

      product.cover = null;
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Cover image removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.removeAImageFromGallery = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    const { imageUrl } = req.body;

    if (!product.gallery.includes(imageUrl)) {
      return res.status(400).json({ message: "Image not found in gallery" });
    }

    const filePath = path.join(__dirname, "..", "public", imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    product.gallery = product.gallery.filter((img) => img !== imageUrl);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Gallery image removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.addProductCover = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    if (product.cover) {
      const oldPath = path.join(__dirname, "../public", product.cover);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const filename = `cover-${Date.now()}.jpeg`;
    await sharp(req.file.path)
      .resize(800, 800)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(path.join(__dirname, "../public/images/products", filename));
    fs.unlinkSync(req.file.path);

    product.cover = `/images/products/${filename}`;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Cover updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.addProductGallery = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    if (!req.files)
      return res.status(400).json({ message: "No images uploaded" });

    const images = req.files;
    const imageUrls =
      images.map((image) =>
        product.gallery.push(`/images/products/${image.filename}`)
      ) || [];

    await product.save();

    res.status(200).json({
      success: true,
      message: "Gallery image added successfully",
      gallery: product.gallery,
    });
  } catch (error) {
    next(error);
  }
};

exports.publishProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    if (product.statusProduct === "published") {
      return res.status(400).json({
        success: false,
        message: "Product already published",
      });
    }

    product.statusProduct = "published";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product published successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};

exports.unPublishProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Product ID is not valid ❌",
      });
    }

    const product = await ProductModel.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ❌",
      });
    }

    if (product.statusProduct === "Unpublished") {
      return res.status(400).json({
        success: false,
        message: "Product already Unpublished",
      });
    }

    product.statusProduct = "Unpublished";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product Unpublished successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};
