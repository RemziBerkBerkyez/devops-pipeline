const express = require("express");
const promClient = require("prom-client");
const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metric — HTTP request counter
const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Health check endpoint
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

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
