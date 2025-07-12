const express = require('express');
const app = express()
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 369
const dbConnect = require('./configs/dbConnect');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path');
dbConnect()
require("dotenv").config();

const authRouter = require('./routes/authRoute');
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/categoryRoute");
const coupenRouter = require("./routes/coupenRoute");
const brandRouter = require("./routes/brandRoute");
const addressRouter = require("./routes/addressRoute");
const orderRouter = require("./routes/orderRoute");
const cartRouter = require("./routes/cartRoute");

app.use("/public", express.static(path.join(__dirname, "public")));

// Set Middlewares
app.use(cookieParser())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


// Api Router
app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)
app.use("/api/product" , productRouter)
app.use("/api/blog" , blogRouter)
app.use("/api/category" , categoryRouter)
app.use("/api/brand" , brandRouter)
app.use("/api/coupen" , coupenRouter)
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);


// Error Handler
app.use(errorHandler)

app.listen(PORT , () => {
    console.log(`Server is running on ${PORT} port ✅👌`);
})