const express = require("express");
const promClient = require("prom-client");
const logger = require("./logger");
const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

app.use(express.json());

// Logging + metrics middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
    logger.info({
      method: req.method,
      route: req.path,
      status: res.statusCode,
      message: "HTTP Request",
    });
  });
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "DevOps Pipeline API",
    version: "1.0.0",
  });
});

app.get("/products", (req, res) => {
  logger.info({ message: "Products endpoint called" });
  res.json([
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 29 },
    { id: 3, name: "Keyboard", price: 79 },
  ]);
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  logger.info({ message: `Server running on port ${PORT}` });
});

module.exports = app;
