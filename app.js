require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./connectDB");
const cors = require("cors");

const loginRouter = require("./routes/login");
const articleRouter = require("./routes/article");
const signupRouter = require("./routes/signup");
const categoryRouter = require("./routes/category");

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ extended: true }));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/login", loginRouter);
app.use("/api/article", articleRouter);
app.use("/api/signup", signupRouter);
app.use("/api/category", categoryRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err,
  });
  return;
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
