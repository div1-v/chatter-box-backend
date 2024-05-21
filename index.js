const express= require('express');
const cors = require('cors');
require('dotenv').config();
const groupRoute = require('./routes/group');
const userRoute = require('./routes/user');
const cookiesParser = require('cookie-parser')
const connectDb = require('./config/dbConfig');
const {app,server} = require('./socket/index')

app.use(express.json());
app.use(cookiesParser())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

app.use("/api", groupRoute);
app.use("/api", userRoute);



const PORT = process.env.PORT || 8080;
connectDb().then(()=>{
    server.listen(PORT, ()=>{
        console.log("Server running at "+ PORT);
    })
})
