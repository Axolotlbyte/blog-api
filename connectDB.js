require("dotenv").config();
const mongoose = require("mongoose");

const mongoURL = process.env.DB_URL

const connectDB = async () => {
  try {
    mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;