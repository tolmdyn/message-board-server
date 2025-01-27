const express = require('express')
const { Post } = require('../models/Post')
const router = express.Router()


const verify = require('../verifyToken')
const User = require('../models/User')

// router.get('/', async (req, res) => { //no verification required to get all posts
//     try {
//         const posts = await Post.find()
//         res.send(posts)
//     } catch (err) {
//         res.status(400).send({ message: err })
//     }
// })

router.get('/', async (req, res) => { //no verification required to get all posts
    try {
        const posts = await Post.aggregate([
            {
                $addFields: {
                    userObjectId: { $toObjectId: '$user' } // Convert user string to ObjectId
                }
            },
            {
                $lookup: {
                    from: 'users', // Collection to join
                    localField: 'userObjectId', // The converted ObjectId field
                    foreignField: '_id', // User collection's ObjectId field
                    as: 'user' // Resulting joined user
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true // Handle posts without matching users
                }
            },
            {
                $project: {
                    title: 1,
                    text: 1,
                    user: { $ifNull: ['$user.username', 'Unknown User'] }, // Use username or fallback
                    date: 1
                }
            },
            {
                $sort: { date: -1 } // Sort by date, newest first
            }
        ]);
        res.json(posts);
    } catch (err) {
        res.status(400).send({ message: err })
    }
})

router.post('/', verify, async (req, res) => {
    const post = new Post({
        title: req.body.title,
        user: req.user._id,
        text: req.body.text,
    })

    try {
        const postToSave = await post.save()
        res.send(postToSave)
    } catch (err) {
        // res.status(400).send({ err })
        // console.error(err); // Debug logging
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        return res.status(400).send({ message: err.message || 'An error occurred' });

    }
})

router.get('/:postId', async (req, res) => {
    try {
        const getPost = await Post.findById(req.params.postId)
        if (getPost) {
            res.send(getPost)
        } else {
            res.status(400).send({ message: "Post doesn't exist" })
        }
    } catch (err) {
        res.status(404).send({ message: err })
    }
})

router.post('/:postId', verify, async (req, res) => {
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

        await Post.findByIdAndUpdate(parentPost._id, { replies: parentPost.replies })
        res.status(200).send(parentPost)

    } catch (err) {
        res.status(400).send({ message: err })
    }
})

module.exports = router

