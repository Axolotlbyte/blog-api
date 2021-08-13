var express = require('express');
var router = express.Router();
var async = require('async');

const Article = require('../models/article');
const Comment = require('../models/comment');

const {body, validationResult} = require('express-validator');
const comment = require('../models/comment');

/* GET home page. */

/// ARTICLE ROUTES /// 

router.get('/', async (req, res) => {
  try{
    const articles = await Article.find()
    res.json(articles)
  }catch(error) {
    res.status(500).json({ message: error.message })
  }
});

router.get('/articles/:id', async (req, res, next) => {
  try{
    const findArticle = await Article.findById(req.params.id)
    if (findArticle == null ) {
      return res.status(404).json({ message: 'Article not found'})
    }
    res.status(201).json(findArticle)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

router.post('/articles', async (req, res) => {
  let article = new Article({
    user: req.body.user,
    title: req.body.title,
    text: req.body.text,
    date: Date.now,
  })

  try{
    const newArticle = await article.save()
    res.status(201).json(newArticle)
  } catch(err){
      res.status(500).json({ message: err.message })
  }
});

router.put('/articles/:id', async (req, res) => {
  const updateArticle = await Article.findByIdAndUpdate(req.params.id , {
    user: req.body.user,
    title: req.body.title,
    content: req.body.content,
    date: Date.now,
    comment: function(callback) {
      Comment.find({'article': req.params.id})
        .exec(callback)
    }
  }, { useFindAndModify: true, new: true })
  if(updateArticle){
    res.json({ message: 'Article Updated'})
  }
});

router.delete('/articles/delete/:id', async (req,res) => {
  const { id } = req.params
  try{
    const findArticle = await Article.findById(id)
    if(findArticle){
      Article.remove()
      res.json({ message: 'Article Deleted'})
    }
  }catch (err) {
    res.status(400).json({ message: err.message })
  }
});

/// COMMENT ROUTES /// 

router.get('/comments', async (req, res) => {
  
  try{
    const comments = await Comment.find()
    res.json(comments)
  }catch(err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/comments/:id', async (req, res) => {
  const { id } = req.params
  try{
    const comment = await Comment.findById(id)
    res.json(comment)
  }catch(err) {
    res.status(400).json({ message: err.message })
  }
})

router.post('/comments', async (req, res) => {
  let comment = new Comment({
    user: req.body.user,
    text: req.body.text,
    article: function(callback) {
      Article.findById({_id : req.params.id})
        .exec(callback)
    },
  })

  try{
    const newComment = await comment.save()
    res.status(201).json(newComment)
  } catch(err){
      res.status(500).json({ message: err.message })
  }
});

router.delete('/comments/:id', async (req, res) => {
  const {id} = req.params
  try{
    const findComment = await Comment.findById(id)
    if(findComment){
      Comment.remove()
      res.json({ message: 'Comment Deleted' })
    }
  } catch(err) {
    res.status(400).json({ message: err.message})
  }
})

module.exports = router;
