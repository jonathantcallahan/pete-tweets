 // const mongoose = require('mongoose')
const {Schema, model} = require('mongoose')

const likeSchema = new Schema({
    likes: Number,
    name: String
})

const Likes = model('Likes', likeSchema)
module.exports = Likes
