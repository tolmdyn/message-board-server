const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 256
    },
    user: { //this should be a valid user but string for now
        type: String,
        required: true,
        minlength: 3,
        maxlength: 256
    },
    text: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 2046
    },
    date: {
        type: Date,
        default: Date.now
    },
    replies: []
})

module.exports.Post = mongoose.model('Post', postSchema) //posts is the database name on which to map PostSchema