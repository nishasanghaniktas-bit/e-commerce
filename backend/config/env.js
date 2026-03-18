require("dotenv").config();

const stripTrailingSlash = (val = "") => val.replace(/\/+$/, "");

const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: stripTrailingSlash(process.env.FRONTEND_URL || "http://localhost:5173"),
  apiBaseUrl: stripTrailingSlash(process.env.API_BASE_URL || "http://localhost:5000"),
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};

module.exports = { config, stripTrailingSlash };
