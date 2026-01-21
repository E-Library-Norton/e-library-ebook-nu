const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./config/database");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/thesis", require("./routes/thesis"));
app.use("/api/publications", require("./routes/publications"));
app.use("/api/journals", require("./routes/journals"));
app.use("/api/audios", require("./routes/audios"));
app.use("/api/videos", require("./routes/videos"));
app.use("/api/search", require("./routes/search"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/upload", require("./routes/upload"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Internal server error",
      details: err.details || null,
    },
  });
});

// Start server
const PORT = process.env.PORT || 5005;

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });


// CORS Configuration
// const cors = require('cors');

// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));