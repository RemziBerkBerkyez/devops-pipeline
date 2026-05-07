const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint — K8s ve monitoring için kritik
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Ana endpoint
app.get("/", (req, res) => {
  res.json({
    message: "DevOps Pipeline API",
    version: "1.0.0",
  });
});

// Ürünler endpoint
app.get("/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 29 },
    { id: 3, name: "Keyboard", price: 79 },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
