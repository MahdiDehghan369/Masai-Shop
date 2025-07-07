const { isValidObjectId } = require("mongoose");
const BlogModel = require("./../models/blogModel");

exports.createBlog = async (req, res, next) => {
  try {
    let { title, description, slug } = req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const isBlogExistsWithSlug = await BlogModel.findOne({ slug });

    if (isBlogExistsWithSlug) {
      return res.status(400).json({
        success: false,
        message: "Blog with this slug already exists",
      });
    }

    const blog = await BlogModel.create({
      title,
      description,
      slug,
      author: req.user._id
    });

    return res.status(200).json({
      success: true,
      message: "Blog created successfully ✅",
      blog,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Artile Id is not valid ❌",
      });
    }

    const blog = await BlogModel.findOne({ _id: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Article not found ❌",
      });
    }

    let { title, description, slug } = req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const isBlogExistsWithSlug = await BlogModel.findOne({
      $and: [
        { slug },
        {
          _id: { $ne: id},
        },
      ],
    });

    if (isBlogExistsWithSlug) {
      return res.status(400).json({
        success: false,
        message: "Blog with this slug already exists",
      });
    }

    blog.title = title;
    blog.description = description;
    blog.slug = slug;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully ✅",
      blog,
    });
  } catch (error) {
    next(error);
  }
};


exports.getBlog = async(req , res, next) => {
    try {
        const {id} = req.params

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Artile Id is not valid ❌",
          });
        }

        const blog = await BlogModel.findOneAndUpdate(
          { _id: id },
          { $inc: { numViews: 1 } }
        )
          .populate("author", "firstname , lastname , email")
          .populate("likes", "firstname , lastname")
          .populate("disLikes", "firstname , lastname");

        if (!blog) {
          return res.status(404).json({
            success: false,
            message: "Article not found ❌",
          });
        }


        return res.status(200).json({
            success: true,
            blog
        })

    } catch (error) {
        next(error)
    }
}

exports.getAllBlogs = async(req , res, next) => {
    try {
        const {
          category,
          sortBy = "createdAt",
          order = "desc",
          page = 1,
          limit = 10,
        } = req.query;

        const query = {};

        if (category) {
          query.category = category;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const sortOption = {};
        sortOption[sortBy] = order === "asc" ? 1 : -1;

        const blogs = await BlogModel.find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(Number(limit))
          .lean();

        const total = await BlogModel.countDocuments(query);

        res.status(200).json({
          success: true,
          data: blogs,
          meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit),
          },
        });
    } catch (error) {
        next(error)
    }
}

exports.removeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Artile Id is not valid ❌",
      });
    }

    const blog = await BlogModel.findOneAndDelete({ _id: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Article not found ❌",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog removed successfully ✅",
    });
  } catch (error) {
    next(error);
  }
};

exports.likeTheBlog = async (req, res, next) => {
  try {
    const { blogId } = req.body;

    if (!isValidObjectId(blogId)) {
      return res.status(422).json({
        success: false,
        message: "Blog ID is not valid ❌",
      });
    }

    const userId = req?.user?._id;

    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found ❌",
      });
    }

    const alreadyLiked = blog.likes.includes(userId);
    const alreadyDisliked = blog.disLikes.includes(userId);

    let message = "";

    if (alreadyLiked) {
      await BlogModel.findByIdAndUpdate(blogId, {
        $pull: { likes: userId },
      });
      message = "Removed like 👍";
    } else {
      if (alreadyDisliked) {
        await BlogModel.findByIdAndUpdate(blogId, {
          $pull: { disLikes: userId },
        });
      }

      await BlogModel.findByIdAndUpdate(blogId, {
        $addToSet: { likes: userId },
      });
      message = "Liked the blog 👍";
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

exports.disLikeTheBlog = async(req , res, next) => {
    try {
        const {blogId} = req.body

        if(!isValidObjectId(blogId)){
            return res.status(422).json({
                success: "Blog Id is not valid ❌"
            })
        }

        const userId = req?.user?.id

        const blog = await BlogModel.findOne({_id: blogId})

        if(!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found ❌"
            })
        }

        const alreadyLiked = blog.likes.includes(userId)
        const alreadyDisLiked = blog.disLikes.includes(userId);

        let message = ""
        if (alreadyDisLiked) {
          await BlogModel.findOneAndUpdate({ _id: blogId }, { $pull: {disLikes:userId} });
          message = "Removed dislike 👍";
        } else {
            if(alreadyLiked){
                await BlogModel.findOneAndUpdate({_id: blogId} , {$pull: {likes: userId}})
            }

            await BlogModel.findOneAndUpdate({_id: blogId}, {$push: {disLikes: userId}})
            message = "DisLiked the blog 👍";
        }

        return res.status(200).json({
          success: true,
          message,
        });
    } catch (error) {
        next(error)
    }
}