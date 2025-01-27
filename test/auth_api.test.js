const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app.js')
const assert = require('assert')

const { userTester, userOther, userSteve, userJeff } = require('./users_example')

before(async () => {
    //We flush the TEST database of all users and posts...
    try {
        mongoose.connection.collections.posts.drop()
        mongoose.connection.collections.users.drop()
    } catch(err) {
        console.log("Problem flushing db");
    }
    //We add user "Tester" globally
    await request(app)
        .post('/auth/register')
        .send(userTester)

    await request(app)
        .post('/auth/register')
        .send(userOther)

  })

describe('POST AUTH /auth/register', () => {
    it('Register a new user with correct input', () => {
        return request(app)
            .post('/auth/register')
            .send(userJeff)
            .expect(200)
            .expect('Content-Type',/json/)
    })

    it('Register an already existing user', () => {
        return request(app)
            .post('/auth/register')
            .send(userJeff)
            .expect(400)
            .expect({"message": "User already exists"})
    })

    it('Register a new user with no password', () => {
        return request(app)
            .post('/auth/register')
            .send({"username" : "Bad User"})
            .expect(400)
            .expect({
                "message": "\"email\" is required"
            })
    })
})

describe('POST /auth/login', () => {
    let token
    it('Login as Tester and receive a token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: userTester.email, password: userTester.password })
            .expect(200)
            .expect('Content-Type', /json/)
        assert(res.body['auth-token']) //assert a token field exists in body
        userTester.token = res.body['auth-token'] //keep the token locally for further testing
            
    })

    it('Login successfully as our registered user and receive a unique token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: userJeff.email, password: userJeff.password })
            .expect(200)
            .expect('Content-Type', /json/)
        assert(res.body['auth-token'])
        userJeff.token = res.body['auth-token']
        assert(userJeff.token != userTester.token) 
            
    })

    it('Fail login with incorrect password', () => {
        return request(app)
            .post('/auth/login')
            .send({email:userJeff.email, password:"opensesame"})
            .expect(400)
            .expect({
                "message": "Password incorrect"
            }) 
            
    })

    it('Fail login with incorrect username', () => {
        return request(app)
            .post('/auth/login')
            .send({email:"todd@hotmail.com", password:userJeff.password})
            .expect(400)
            .expect({
                "message": "User does not exist"
            })
            
    })

    it('Fail login with incorrect parameters', () => {
        return request(app)
            .post('/auth/login')
            .send({email:"whatisthis", password:""})
            .expect(400)
            .expect({
                "message": "\"email\" must be a valid email"
            })
            
    })
})

//delete user
