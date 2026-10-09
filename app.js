const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/productRoutes");
const errorHandler = require("./middleware/errorHandler");
dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Inventory Management API is running"
  });
});
app.use(errorHandler);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});