const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title:{
        type:String,
        require:true,
        min:5,
        max:256
    },
    user:{ //this should be a valid user but string for now
        type:String,
        require:true,
        min:3,
        max:256
    },
    text:{
        type:String,
        require:true,
        min:3,
        max:2046
    },
    date:{
        type:Date,
        default:Date.now
    },
    replies:[]
})

module.exports = mongoose.model('posts', postSchema) //posts is the database name on which to map PostSchema