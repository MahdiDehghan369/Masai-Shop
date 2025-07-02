const { default: mongoose } = require("mongoose")
require('dotenv').config();

const dbConnect = async () => {
     try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully ✅😉");
     } catch (error) {
        console.log(`Database Error ❌ => ${error}`);
        throw new Error(error)
     }
}


module.exports = dbConnect