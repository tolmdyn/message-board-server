const jwt = require('jsonwebtoken')

function auth(req, res, next){
    const token = req.header('auth-token')
    if(!token){
        return res.status(401).send({message:'Missing token'})
    }
    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        //console.log(req.user);
        next()
    } catch(err){
        return res.status(401).send({message:'Incorrect token'})
    }
}

module.exports = auth