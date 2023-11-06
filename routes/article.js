const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

const Article = require("../models/article");

require("dotenv").config();

//Post route
router.post(
  "/",
  [
    // auth,
    // checkAdmin,
    [
      check("title", "Enter a title for your post").trim().not().isEmpty(),
      check("content", "Post body must not be empty").trim().not().isEmpty(),
    ],
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors)
      console.log(req.body)
      return res.status(400).json({ error: errors.array() });
    }

    const { title, subtitle, content, image, category } = req.body;

    try {
      const newArticle = new Article({
        // user: req.user.id,
        title: title,
        content: content,
        image: image,
        category: category,
        subtitle,
      });

      const article = await newArticle.save();

      res.json(article);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//Edit article route
router.put(
  "/:id",
  [
    // auth,
    // checkAdmin,
    [
      check("title", "Enter a title for your post").trim().not().isEmpty(),
      check("content", "Post body must not be empty").trim().not().isEmpty(),
    ],
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let article = await Article.findById(req.params.id);

      if (!post) {
        return res.status(400).json({ errors: [{ msg: "Article not found" }] });
      }

      const { title, content, category, image } = req.body;

      article.title = title;
      article.content = content;
      article.category = category;
      article.image = image;

      await article.save();

      res.json(article);
      return;
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
      return;
    }
  }
);

// Get all articles route
router.get("/", async (req, res) => {
  try {
    if (req.query.sort) {
      const articles = await Article.find({ category: req.query.sort })
        // .populate("user")
        // .populate("category")
        .populate({
          path: "comment",
          populate: {
            path: "user",
            model: "User",
          },
        })
        .sort({
          date: -1,
        });
      if (articles.length === 0)
        res.status(404).json({ errors: [{ msg: "Articles not found" }] });

      res.json(articles);
      return;
    }
    const articles = await Article.find()
      // .populate("category")
      // .populate("user")
      .populate({
        path: "comment",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .sort({ date: -1 });

    res.json(articles);
    return;
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
    return;
  }
});

//Ger article by id
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      // .populate("category")
      // .populate("user")
      .populate({
        path: "comment",
        populate: {
          path: "user",
          model: "User",
        },
      });

    if (!article) {
      res.status(404).json({ errors: [{ msg: "Article not found" }] });
      return;
    }

    res.json(article);
    return;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
    return;
  }
});

//Delete an Article
router.delete("/:id", auth, checkAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      res.status(404).json({ errors: [{ msg: "Article not found" }] });
      return;
    }

    await article.remove();

    res.json({ msg: "Article removed" });
    return;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
    return;
  }
});

//Post a comment
router.post(
  "/:id/comments",
  auth,
  [check("text", "Comment must be at least 5 characters").trim().isLength(5)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const article = await Article.findById(req.params.id);
      console.log(article);

      const comment = {
        user: req.user.id,
        text: req.body.text,
      };

      article.comment.push(comment);

      await article.save();

      const newArticle = await Article.findById(req.params.id).populate({
        path: "comment",
        populate: {
          path: "user",
          model: "User",
        },
      });

      res.json(newArticle);
      return;
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
      return;
    }
  }
);

//Delete a comment
router.delete(
  "/:id/comments/:comment_id",
  auth,
  checkAdmin,
  async (req, res) => {
    try {
      const { id, comment_id } = req.params;

      const article = await Article.findById(id);
      const comment = await article.comment.find(
        (comment) => comment._id.toString() === comment_id
      );

      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }

      await comment.remove();

      await article.save();

      res.json({ msg: "Comment removed" });

      return;
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
      return;
    }
  }
);

module.exports = router;
