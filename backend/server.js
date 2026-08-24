require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const zlib = require("zlib");

app.use(cors());

// High-speed response compression middleware using built-in zlib
app.use((req, res, next) => {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const compressAndSend = (data, isJson = false) => {
    const payload = isJson ? JSON.stringify(data) : data;
    const buffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload || "", "utf-8");

    // Only compress payloads larger than 1KB
    if (buffer.length < 1024) {
      if (isJson) res.setHeader("Content-Type", "application/json; charset=utf-8");
      return originalSend(buffer);
    }

    if (acceptEncoding.includes("gzip")) {
      res.setHeader("Content-Encoding", "gzip");
      if (isJson) res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.removeHeader("Content-Length");
      zlib.gzip(buffer, (err, compressed) => {
        if (err) return originalSend(buffer);
        originalSend(compressed);
      });
    } else if (acceptEncoding.includes("deflate")) {
      res.setHeader("Content-Encoding", "deflate");
      if (isJson) res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.removeHeader("Content-Length");
      zlib.deflate(buffer, (err, compressed) => {
        if (err) return originalSend(buffer);
        originalSend(compressed);
      });
    } else {
      if (isJson) res.setHeader("Content-Type", "application/json; charset=utf-8");
      return originalSend(buffer);
    }
  };

  res.json = (data) => compressAndSend(data, true);
  next();
});

// Increase payload size limit to handle base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "BoardLanka API Server", 
    version: "1.0.0",
    endpoints: {
      properties: "/api/properties",
      auth: "/api/auth",
      users: "/api/users"
    }
  });
});

// Test endpoint to verify API is working
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working", timestamp: new Date().toISOString() });
});

try {
  console.log("Loading routes...");
  const propertyRoutes = require("./routes/propertyRoutes");
  const authRoutes = require("./routes/authRoutes");
  const userRoutes = require("./routes/userRoutes");
  const problemRoutes = require("./routes/problemRoutes");
  const contactRoutes = require("./routes/contactRoutes");

  console.log("✓ Routes loaded successfully");
  app.use("/api/properties", propertyRoutes);
  console.log("✓ Property routes registered at /api/properties");
  app.use("/api/auth", authRoutes);
  console.log("✓ Auth routes registered at /api/auth");
  app.use("/api/users", userRoutes);
  console.log("✓ User routes registered at /api/users");
  app.use("/api/problems", problemRoutes);
  console.log("✓ Problem routes registered at /api/problems");
  app.use("/api/contact", contactRoutes);
  console.log("✓ Contact routes registered at /api/contact");
} catch (err) {
  console.error("✗ Error loading routes:", err.message);
  console.error("Stack trace:", err.stack);
  process.exit(1);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.message);
  console.error("Stack:", err.stack);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

const server = app.listen(port, () => {
  console.log(`✓ Server running on port ${port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err.message);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try killing the existing process.`);
  }
  process.exit(1);
});

server.on("connection", () => {
  console.log("Client connected");
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});