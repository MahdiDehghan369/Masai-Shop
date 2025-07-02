const jwt = require('jsonwebtoken');

exports.generateAccessToken = (id) => {
    try {
        return jwt.sign({id} , process.env.JWT_SECRET_KEY , {expiresIn: "1d"})
    } catch (error) {
        throw new Error(error)
    }
}

exports.generateRefreshToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });
  } catch (error) {
    throw new Error(error);
  }
};

