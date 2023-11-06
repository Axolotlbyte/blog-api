var mongoose = require("mongoose");
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  title: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  subtitle: {
    type: String,
    required: false,
    // minLength: 3,
    // maxLength: 100,
  },
  image: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    // minLength: 3,
    // maxLength: 1000,
  },
  category: {
    // type: Schema.Types.ObjectId,
    // ref: "Category",
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comment: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

ArticleSchema.virtual("url").get(function () {
  return "/Article/" + this._id;
});

ArticleSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Article", ArticleSchema);
