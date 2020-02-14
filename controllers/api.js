const rp = require('request-promise')
const {APPID, APPKEY} = require('./../config.json')
const crypto = require('crypto')
console.log(APPID, APPKEY)
 

// https://github.com/googleapis/nodejs-language/blob/master/samples/analyze.v1.js
// https://cloud.google.com/natural-language/docs/reference/rest/v1beta2/documents/analyzeSyntax


module.exports = (app,Word,Sentence) => {
    app.post('/api/word', (req,res) => {
        const {word} = req.body
        Word.findOne({word:word}, (err,w ) => {
            console.log(w)
            if(w){
                console.log('word found', w)
                res.send('asdf')
            } else {
                console.log(word)
                const options = {
                    url: `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}`,
                    headers: {
                        app_id: APPID,
                        app_key: APPKEY
                    }
                }
                var grammar = 'undefined'
                const cb = (error, response, body) => {
                    
                    if(!error){
                        const b = JSON.parse(body)
                        grammar = b.results[0].lexicalEntries[0].lexicalCategory
                    }
                    res.send(JSON.stringify(grammar))
                }
                rp(options)
                    .then(d => {
                        d = JSON.parse(d)
                        // res.send(JSON.stringify(d))
                        return d.results[0].lexicalEntries ? d.results[0].lexicalEntries[0].lexicalCategory : 'undefined'
                    })
                    .then(lexicalCategory => {
                        console.log(lexicalCategory)
                        res.send(lexicalCategory)
                    })
                    .catch(err => console.log(err))
                // const entry = new Word({word:word, lexicalCategory: grammar})
                // entry.save()
            }

        })
    })

    app.post('/api/save-tweet', (req,res) => {
        const {tweet} = req.body
        console.log(tweet)
        const md5sum = crypto.createHash('md5').update(tweet.join(' ')).digest('hex')
        console.log(md5sum)
        res.send(md5sum)
    })
}