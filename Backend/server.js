const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();

/* ===============================
   🔹 MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   🔥 SERVE FRONTEND (optional)
================================ */
app.use(express.static(path.join(__dirname, "../Frontend")));

/* ===============================
   🔹 API ROUTES
================================ */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));

/* ===============================
   🔹 ROOT
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/frontend.html"));
});

/* ===============================
   🔹 TEST ROUTE
================================ */
app.get("/test", (req, res) => {
  res.send("SERVER IS RUNNING ✅");
});

/* ===============================
   🔹 START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
