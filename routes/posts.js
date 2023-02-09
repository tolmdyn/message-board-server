const express = require('express')
const Post = require('../models/Post')
const router = express.Router()


const verify = require('../verifyToken')
const User = require('../models/User')

router.get('/', async(req,res) =>{ //no verification required to get all posts
    try {
        const posts = await Post.find()
        res.send(posts)
    } catch(err) {
        res.status(400).send({message:err})
    }
})

router.post('/', verify, async(req,res) =>{
    const post = new Post({
        title: req.body.title,
        user: req.user._id,
        text: req.body.text,
        replies: []
    })

    try {
        const postToSave = await post.save()
        res.send(postToSave)
    } catch (err) {
        res.send({ message: err })
    }
})

router.get('/:postId', async (req, res) => {
    try {
        const getPost = await Post.findById(req.params.postId)
        res.send(getPost)
    } catch (err) {
        res.status(404).send({ message: err })
    }
})

router.post('/:postId', verify, async(req,res) =>{
    //make a post as comment res.send(req.params.postId)
    try {
        const parentPost = await Post.findById(req.params.postId)

        const childPost = new Post({
            title: req.body.title,
            user: req.user._id,
            text: req.body.text,
            replies: []
        })

        parentPost.replies.push(childPost)

        await Post.findByIdAndUpdate(parentPost._id, {replies:parentPost.replies})
        res.status(200).send(parentPost)

    } catch (err){
       res.status(400).send({ message: err })
    }
})

module.exports = router

