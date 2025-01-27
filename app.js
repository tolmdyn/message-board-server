const express = require('express')
const app = express()
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));


app.use(express.json())
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const mongoose = require('mongoose')
require('dotenv/config')


mongoose.set('strictQuery', true)

mongoose.connect(process.env.DB_CONNECTOR, ()=>{
    console.log('DB is connected')
})

const postsRoute = require('./routes/posts')
const authRoute = require('./routes/auth')

app.use('/posts', postsRoute)
app.use('/auth', authRoute)

const port = 3000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})

module.exports = app