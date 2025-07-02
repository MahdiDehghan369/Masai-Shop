const express = require('express');
const app = express()
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 369
const dbConnect = require('./configs/dbConnect');
const errorHandler = require('./middlewares/errorHandler');
dbConnect()
require("dotenv").config();

const authRouter = require('./routes/authRoute');
const userRouter = require("./routes/userRoute");

// Set Middlewares
app.use(cookieParser())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


// Api Router
app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)


// Error Handler
app.use(errorHandler)

app.listen(PORT , () => {
    console.log(`Server is running on ${PORT} port ✅👌`);
})