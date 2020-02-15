const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000
const app = express()
const {URI} = require('./config.json')

mongoose.Promise = Promise
mongoose.connect(URI, {useNewUrlParser:true})

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended:true }))
app.use(bodyParser.json())

const api = require('./controllers/api')
const html = require('./controllers/html')
const Word = require('./models/words')
const Sentence = require('./models/sentence')
const Tweet = require('./models/tweet')
const Likes = require('./models/likes')
api(app, Word, Sentence, Tweet, Likes)
html(app)

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))