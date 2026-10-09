const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// CREATE PRODUCT
router.post("/", async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    let sortOption = {};
    if (sort === "price_asc") {
      sortOption.price = 1;
    } else if (sort === "price_desc") {
      sortOption.price = -1;
    } else if (sort === "quantity_asc") {
      sortOption.quantity = 1;
    } else if (sort === "quantity_desc") {
      sortOption.quantity = -1;
    } else if (sort === "name_asc") {
      sortOption.name = 1;
    } else if (sort === "name_desc") {
      sortOption.name = -1;
    } else {
      sortOption.createdAt = -1;
    }
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);
    const total = await Product.countDocuments(filter);
    res.status(200).json({
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/low-stock
router.get("/low-stock", async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: ["$quantity", "$reorderLevel"]
      }
    }).sort({ quantity: 1 });
    res.status(200).json({
      count: products.length,
      lowStockItems: products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/category-summary
router.get("/category-summary", async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: {
            $sum: 1
          },
          totalQuantity: {
            $sum: "$quantity"
          },
          totalInventoryValue: {
            $sum: {
              $multiply: ["$price", "$quantity"]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalProducts: 1,
          totalQuantity: 1,
          totalInventoryValue: 1
        }
      },
      {
        $sort: {
          category: 1
        }
      }
    ]);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    res.status(200).json({
      message: "Product deleted",
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;