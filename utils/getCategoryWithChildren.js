const CategoryModel = require('./../models/categoryModel');

const getCategoryWithChildren = async (categoryId) => {
  const category = await CategoryModel.findById(categoryId)
    .populate("parent", "title slug _id")
    .lean();

  if (!category) return null;

  const children = await CategoryModel.find({ parent: categoryId }).lean();

  category.children = await Promise.all(
    children.map(async (child) => await getCategoryWithChildren(child._id))
  );

  return category;
};


module.exports = getCategoryWithChildren