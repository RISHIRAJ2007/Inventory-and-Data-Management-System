const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((error) => error.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "SKU already exists"
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid Product ID"
    });
  }

  res.status(500).json({
    message: "Internal Server Error"
  });
};

module.exports = errorHandler;