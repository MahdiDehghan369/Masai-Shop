const { isValidObjectId } = require("mongoose");
const BlogModel = require("./../models/blogModel");
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

exports.createBlog = async (req, res, next) => {
  try {
    let { title, description, slug , category } = req.body;

    slug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const isBlogExistsWithSlug = await BlogModel.findOne({ slug });

    if (isBlogExistsWithSlug) {
      return res.status(400).json({
        success: false,
        message: "Blog with this slug already exists",
      });
    }

    if (!isValidObjectId(category)) {
          return res.status(422).json({
            success: false,
            message: "Category ID is not valid",
          });
        }
    
        const existsCategory = await CategoryModel.findOne({ _id: category , type: "blog" });
    
        if (!existsCategory) {
          return res.status(404).json({
            success: false,
            message: "Category Not Found",
          });
        }

    const blog = await BlogModel.create({
      title,
      description,
      slug,
      category,
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

    let { title, description, slug , category } = req.body;

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

       if (!isValidObjectId(category)) {
         return res.status(422).json({
           success: false,
           message: "Category ID is not valid",
         });
       }

       const existsCategory = await CategoryModel.findOne({
         _id: category,
         type: "blog",
       });

       if (!existsCategory) {
         return res.status(404).json({
           success: false,
           message: "Category Not Found",
         });
       }

    blog.title = title;
    blog.category = category;
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

    if(blog.cover){
      const coverPath = path.join(__dirname , ".." , "public" , blog.cover)
      fs.unlinkSync(coverPath)
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

exports.addBlogCover = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Blog ID is not valid ❌",
      });
    }

    const blog = await BlogModel.findOne({ _id: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found ❌",
      });
    }

    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    if (blog.cover) {
      const oldPath = path.join(__dirname, "../public", blog.cover);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const filename = `cover-${Date.now()}.jpeg`;
    await sharp(req.file.path)
      .resize(800, 800)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(path.join(__dirname, "../public/images/blogs", filename));
    fs.unlinkSync(req.file.path);

    blog.cover = `/images/blogs/${filename}`;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Cover updated successfully",
    });
  } catch (err) {
    fs.unlinkSync(req.file.path);
    next(err);
  }
};

exports.removeBlogCover = async(req , res , next) => {
  try {

    const {id} = req.params

    if(!isValidObjectId(id)){
      return res.status(422).json({
        success: false,
        message: "Blog ID is not valid ❌"
      })
    }

    const blog = await BlogModel.findOne({ _id: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found ❌",
      });
    }

    if (blog.cover) {
      const coverPath = path.join(__dirname, "..", "public", blog.cover);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }

      blog.cover = null;
      await blog.save();
    }

    res.status(200).json({
      success: true,
      message: "Cover image removed successfully",
    });
    
  } catch (error) {
    next(error)
  }
}