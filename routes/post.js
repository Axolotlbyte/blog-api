const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

const Article = require('../models/article')

require("dotenv").config();

//Post route
router.post(
    "/",
    [
        auth,
        checkAdmin,
        [
            check("title", "Enter a title for your post").trim().not().isEmpty(),
            check("content", "Post body must not be empty").trim().not().isEmpty(),
        ],
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400),json({error: error.array() });
        }
    
        try {
            const newArticle = new Article({
                user: req.user.id,
                title: req.body.title,
                content: req.body.content,
            });

            const article = await newArticle.save()

            res.json(article)
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
    
)

//Edit article route
router.put(
    "/:id",
    [
        auth,
        checkAdmin,
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
                return res.status(400).json({ errors: [{ msg: "Article not found"}] })
            }

            const { title, content } = req.body;

            article.title = title;
            article.content = content;

            await article.save()
            
            res.json(article)
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ errors: [{ msg: "Server error" }] });
        }
    }
);

// Get all articles route
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find()
          .sort({ date: -1 })
        
        res.json(articles);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: [{ msg: "Server error" }] })
    }
});

//Ger article by id
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
          .populate("user");
        
        if (!article) {
            res.status(404).json({ errors: [{ msg: "Article not found" }] });
        }

        res.json(article)
    } catch (err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//Delete an Article
router.delete("/:id", auth, checkAdmin, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!post) {
            res.status(404).json({ errors: [{ msg : "Article not found" }] });
        }

        await article.remove();

        res.json({ msg: "Article removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//Post a comment
router.post(
    "/:id/comments",
    [
      check("name", "Please enter a name").trim().not().isEmpty(),
      check("text", "Comment must be at least 5 characters").trim().isLength(5),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const article = await Article.findById(req.params.id);
        console.log(article)

        const comment = {
          name: req.body.name,
          text: req.body.text,
        };
  
        article.comment.push(comment);
  
        await article.save();
  
        res.json(article);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
);

//Delete a comment 
router.delete("/:id/comments/:comment_id", auth, async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
  
      const comment = post.comments.find(
        (comment) => comment._id.toString() === req.params.comment_id
      );
  
      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }
  
      await comment.delete();
  
      res.json(article.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

module.exports = router;