const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tweetSchema = new Schema({
    tweet: String
})

const Tweet = mongoose.model('Tweet',tweetSchema)
module.exports = Tweet