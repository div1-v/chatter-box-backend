const express = require("express");
const cors = require("cors");
require("dotenv").config();
const groupRoute = require("./routes/group");
const userRoute = require("./routes/user");
const cookiesParser = require("cookie-parser");
const connectDb = require("./config/dbConfig");
const { app, server } = require("./socket/index");

app.use(express.json());
app.use(cookiesParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api", groupRoute);
app.use("/api", userRoute);

const PORT = process.env.PORT || 8080;
connectDb().then(() => {
  server.listen(PORT, () => {
    console.log("Server running at " + PORT);
  });
});

// keep server running
const apiUrl1 = 'https://chatter-box-backend-zudn.onrender.com';
const apiUrl2 = 'https://blogging-app-qwgp.onrender.com';
setInterval(() => {
  fetch(apiUrl1)
    .then((data) => console.log("Page Refreshed:"))
    .catch((error) => console.error("Error:"));

  fetch(apiUrl2)
    .then((data) => console.log("Page Refreshed:"))
    .catch((error) => console.error("Error:", error));
}, 20000);
