const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wordsSchema = new Schema({
    word: String,
    lexicalCategory: String
})

const Word = mongoose.model('Word',wordsSchema)
module.exports = Word