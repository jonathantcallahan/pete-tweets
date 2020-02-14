// const mongoose = require('mongoose')
const {Schema, model} = require('mongoose')

const sentenceSchema = new Schema({
    sentence: Number
})

const Sentence = model('Sentence', sentenceSchema)
module.exports = Sentence
