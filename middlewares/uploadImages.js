const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require('fs');

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const multerFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      const format = path
        .extname(file.originalname)
        .toLowerCase()
        .replace(".", "");
      await sharp(file.path)
        .resize(300, 300)
        .toFormat(format === "jpg" ? "jpeg" : format)
        .toFile(`public/images/products/${file.filename}`);
      fs.unlinkSync(file.path); 
    })
  );

  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      const format = path
        .extname(file.originalname)
        .toLowerCase()
        .replace(".", "");
      await sharp(file.path)
        .resize(300, 300)
        .toFormat(format === "jpg" ? "jpeg" : format)
        .toFile(`public/images/blogs/${file.filename}`);
      fs.unlinkSync(file.path);
    })
  );

  next();
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = {
  uploadPhoto,
  productImgResize,
  blogImgResize,
};
