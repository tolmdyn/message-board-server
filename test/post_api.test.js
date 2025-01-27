const request = require('supertest')
const app = require('../app.js')

const mongoose = require('mongoose')

const assert = require('assert')
const { expect } = require('chai')

const { userTester } = require('./users_example')
const { userOther } = require('./users_example')

describe('Authorize user', () => {
  it("Login as user. Responds with login token", async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: userTester.email, password: userTester.password })
      .expect(200)
    expect(res.body).to.have.property('auth-token')
    userTester.token = res.body
  })
  
  it("Login as other user. Responds with login token", async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: userOther.email, password: userOther.password })
      .expect(200)
    expect(res.body).to.have.property('auth-token')
    userOther.token = res.body
  })
})

/* TESTING THE "POST POSTS" ENDPOINT*/
describe('POST /posts', () => {
  it('Make a successful post', async () => {
    await request(app)
      .post('/posts')
      .set(userTester.token)
      .send({
        "text": "This is the text of the post.",
        "title": "A Great Post"
      })
      .expect(200)
  })
  it('Fail if no token', async () => {
    await request(app)
      .post('/posts')
      .send({
        "text": "This will not work",
        "title": "A Bad Post"
      })
      .expect(401)
      .expect({
        "message": "Missing token"
      })
  })
  it('Fail if bad token', async () => {
    await request(app)
      .post('/posts')
      .set({ "auth-token": "deadbeef" })
      .send({
        "text": "This will not work",
        "title": "A Bad Post"
      })
      .expect(401)
      .expect({
        "message": "Incorrect token"
      })
  })
  it('Fail if bad format', async () => {
    res = await request(app)
      .post('/posts')
      .set(userTester.token)
      .send({
        "text": "This post has no title.",
      })
      .expect(400)
      expect(res.body).to.deep.equal({
        "message": "Post validation failed: title: Path `title` is required."
      })

    res = await request(app)
      .post('/posts')
      .set(userTester.token)
      .send({
        "title": "This post has no text.",
      })
      .expect(400)
      .expect({
        "message": "Post validation failed: text: Path `text` is required."
      })
  })
})

// /* TESTING THE GET POSTS ENDPOINT*/
describe('GET /posts', () => {
    let target_post

    it('Make a candidate post', async () => {
        const res = await request(app)
            .post('/posts')
            .set(userTester.token)
            .send({
                "text": "This post is readable",
                "title": "A Post For Everyone"
            })
            .expect(200)
        expect(res.body).to.have.property('_id')
        expect(res.body).to.have.property('title')
        expect(res.body).to.have.property('text')
        target_post = res.body
    })

    it('Get (all) /posts as authorized user', async () => {
        res = await request(app)
            .get('/posts')
            .set(userTester.token)
            .expect(200)
    })
    // it('Fail to get (all) /posts as unauthorized user', () => {
    //     return request(app)
    //         .get('/posts')
    //         .expect(401)
    // })
        it('Get (all) /posts as unauthorized user', () => {
        return request(app)
            .get('/posts')
            .expect(200)
    })
    it('Get an existing post as authorized user', async () => {
        res = await request(app)
            .get(`/posts/${target_post._id}`)
            .set(userTester.token)
            .expect(200)
        expect(res.body).to.have.property("title", "A Post For Everyone")
    })
    it('Get post as authorized other user', async () => {
        await request(app)
            .get(`/posts/${target_post._id}`)
            .set(userOther.token)
            .expect(200)
    })
    it('Fail to get non-existing post', async () => {
        res = await request(app)
            .get('/posts/6404ab713c30e571a322d2d7')
            .set(userTester.token)
            .expect(400)
            .expect({ "message": "Post doesn't exist" })


    })
})

// /* TESTING PUTS / LIKES ENDPOINTS */
// describe('PUT /posts/id/like', () => {
//     let target_post

//     it('Make a candidate post', async () => {
//         const res = await request(app)
//             .post('/posts')
//             .set(userTester.token)
//             .send({
//                 "text": "This post is likeable",
//                 "title": "A Popular Post"
//             })
//             .expect(200)
//         expect(res.body).to.have.property('_id')
//         expect(res.body).to.have.property('title')
//         expect(res.body).to.have.property('text')
//         expect(res.body.likes.count).to.equal(0)
//         target_post = res.body
//     })
//     it('Successfully like a post', async () => {
//         original = await request(app)
//             .get(`/posts/${target_post._id}`)
//             .set(userTester.token)
//             .expect(200)

//         updated = await request(app)
//             .put(`/posts/${target_post._id}/like`)
//             .set(userOther.token)
//             .expect(200)

//         expect(updated.body.likes.count).to.equal(original.body.likes.count + 1)
//     })
//     it('Fail to post a second like', async () => {
//         res = await request(app)
//             .put(`/posts/${target_post._id}/like`)
//             .set(userOther.token)
//             .expect(400)
//             .expect({ "message": "User has already liked post" })
//     })
//     it('Fail to like own post', async () => {
//         res = await request(app)
//             .put(`/posts/${target_post._id}/like`)
//             .set(userTester.token)
//             .expect(400)
//             .expect({ "message": "User cannot like own post" })
//     })
//     it('Fail to like a non-existent post', async () => {
//         res = await request(app)
//             .put(`/posts/640502c6cf0ca5688a4fe6a9/like`)
//             .set(userTester.token)
//             .expect(400)
//             .expect({ "message": "Post doesn't exist" })
//     })
// })

// /*!! test editing a post !!*/
// describe('PUT /posts/id/', () => {
//     let original

//     it('Make a candidate post', async () => {
//         original = await request(app)
//             .post('/posts')
//             .set(userTester.token)
//             .send({
//                 "text": "This plost contlains lerrors.",
//                 "title": "A post with mistakes"
//             })
//             .expect(200)
//         target_id = original.body._id
//     })
//     it('Successfully edit a post', async () => {
//         edited = await request(app)
//             .put(`/posts/${target_id}`)
//             .set(userTester.token)
//             .send({
//                 "text": "This post contains no errors.",
//             })
//             .expect(200)
//         assert(edited.body.text == "This post contains no errors.")
//         assert(edited.body.text != original.body.text)
//     })
//     it('Fail to edit another users post', async () => {
//         edited = await request(app)
//             .put(`/posts/${target_id}`)
//             .set(userOther.token)
//             .expect(400)
//             .expect({ "message": "User is not the posts owner" })
//     })


// })
// /* TESTING POSTS / COMMENTS ENDPOINTS */
// describe('POST /post/id/comment', () => {
//     let target_post

//     it('Make a candidate post', async () => {
//         original = await request(app)
//             .post('/posts')
//             .set(userTester.token)
//             .send({
//                 "text": "This post will generate lots of comments.",
//                 "title": "A controversial post!"
//             })
//             .expect(200)

//         target_post = original.body
//         assert(target_post.title == "A controversial post!")
//     })
//     it('Successfully leave a comment', async () => {
//         await request(app)
//             .post(`/posts/${target_post._id}/comment`)
//             .set(userOther.token)
//             .send({
//                 "text": "A comment on a post.",
//             })
//             .expect(200)
//     })
//     it('Fail to leave a badly formatted comment', async () => {
//         await request(app)
//             .post(`/posts/${target_post._id}/comment`)
//             .set(userOther.token)
//             .send({
//             })
//             .expect(400)
//             .expect({ "message": "Comment must have text." })
//     })
//     it('Fail to comment on own post', async () => {
//         await request(app)
//             .post(`/posts/${target_post._id}/comment`)
//             .set(userTester.token)
//             .send({
//             })
//             .expect(400)
//             .expect({ "message": "User cannot comment on own post."})
//     })
//     it('Fail to make unauthorised comment', async () => {
//         await request(app)
//             .post(`/posts/${target_post._id}/comment`)
//             .send({
//             })
//             .expect(401)
//             .expect({ "message": "Missing token" })
//     })
//     it('Fail to comment on non-existent post', async () => {
//         await request(app)
//             .post(`/posts/641c659ef3e02a1cecb9644f/comment`)
//             .set(userTester.token)
//             .send({
//             })
//             .expect(400)
//             //
//     })
// })

// /* TESTING THE "DELETE POSTS" ENDPOINT*/
// describe('DELETE /post/_id', () => {
//     let target_post

//     it('Make a candidate post', async () => {
//         const res = await request(app)
//             .post('/posts')
//             .set(userTester.token)
//             .send({
//                 "text": "This post is doomed",
//                 "title": "A Post To Be Deleted"
//             })
//             .expect(200)
//         expect(res.body).to.have.property('_id')
//         expect(res.body).to.have.property('title')
//         expect(res.body).to.have.property('text')
//         target_post = res.body
//     })
//     it('Fail to delete a non-existent post', async () => {
//         const res = await request(app)
//             .delete('/posts/640863731002ef378c704367')
//             .set(userTester.token)
//             .expect(400)
//             .expect({
//                 "message": "Post doesn't exist"
//             })
//     })
//     it('Fail to delete as unauthorised user', async () => {
//         const res = await request(app)
//             .delete('/posts/640863731002ef378c704367')
//             .expect(401)
//             .expect({
//                 "message": "Missing token"
//             })
//     })
//     it('Fail to delete as authorised non-owner', async () => {
//         const res = await request(app)
//             .delete(`/posts/${target_post._id}`)
//             .set(userOther.token)
//             .expect(400)
//             .expect({
//                 "message": "User can only delete own posts."
//             })
//     })
//     it('Successfully delete the post', async () => {
//         res = await request(app)
//             .delete(`/posts/${target_post._id}`)
//             .set(userTester.token)
//             .expect(200)

//         //get all posts
//         res = await request(app)
//             .get(`/posts/${target_post._id}`)
//             .set(userTester.token)
//             .expect(400)
//             .expect({
//                 "message": "Post doesn't exist"
//             })
//     })
// })