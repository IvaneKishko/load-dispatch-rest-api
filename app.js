const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const landingRoutes = require("./routes/landing-routes");
const loadRoutes = require("./routes/loads-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(cors());

app.use(landingRoutes);
app.use("/api/loads", loadRoutes);
app.use("/api/users", userRoutes);
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  // Checks if response is already sent
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(error);
    });
  }
  if (res.headersSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q13yfea.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    // 'mongodb+srv://load-dispatch-user:load1234@cluster0.q13yfea.mongodb.net/mern-prod?retryWrites=true&w=majority'
  )
  .then(() => app.listen(process.env.PORT || 5000))
  .catch((err) => {
    console.log(err);
  });
