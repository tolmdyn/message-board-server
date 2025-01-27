const express = require('express')
const router = express.Router()

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const {registerValidation, loginValidation} = require('../validations/validation')


router.post('/register', async (req,res) => {
    //Validation to check user input
    const {error} = registerValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }
    
    //Validation for duplicate user
    const userExists = await User.findOne({email:req.body.email})
    if (userExists){
        return res.status(400).send({message:'User already exists'})
    }

    //Hash the password
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password, salt)

    //Create new user from the body data
    const user = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword
    })

    try{
        const savedUser = await user.save()
        res.send(savedUser)
    } catch (err){
        res.status(400).send({message:err})
    }
    
})

router.post('/login', async(req,res)=>{
    //Validation 1 to check user input
    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    //Validation 2 for duplicate user
    const user = await User.findOne({email:req.body.email})
    if (!user){
        return res.status(400).send({message:'User does not exist'})
    }

    //Validation 3 check user password
    const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
    if (!passwordValidation){
        return res.status(400).send({message:'Password incorrect'})
    }

    //Generate a token
    const token = jwt.sign({_id:user._id}, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send({'auth-token':token, 'user':user})

    // res.send('SUCCESS')
})

module.exports = router