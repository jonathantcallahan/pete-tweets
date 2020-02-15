const rp = require('request-promise')
const {APPID, APPKEY} = require('./../config.js')
const crypto = require('crypto')
 

// https://github.com/googleapis/nodejs-language/blob/master/samples/analyze.v1.js
// https://cloud.google.com/natural-language/docs/reference/rest/v1beta2/documents/analyzeSyntax


module.exports = (app,Word,Sentence,Tweet,Likes) => {
    app.post('/api/likes', (req,res) => {
        const {type, target} = req.body
        if(type === 'add') {
            Likes.findOneAndUpdate({name:target}, {$inc : { likes: 1 }}).exec((err,likes) => {
                if(!likes){
                    var l = new Likes({
                        likes: 1,
                        name: likes
                    })
                    l.save()
                }
                res.send(likes)
            })
        } else {
            Likes.findOne({name:target}).exec((err,likes) => {
                if(err) { res.send(err); return }
                res.send(likes)
            })
        }
          
    })
    
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

    app.post('/api/get-tweet', (req, res) => {
        const {hash} = req.body
        console.log(hash)
        Tweet.find({hash:hash}, (err, t) => {
            if(err) { 
                console.log(err)
                res.send(err)
                return
            }
            console.log(t)
            res.send(t)
        })
    })

    app.post('/api/save-tweet', (req,res) => {
        const {tweet} = req.body
        async function createHash () {
            let promise = new Promise(function (resolve, reject) {
                resolve(crypto.createHash('md5').update(tweet.join(' ')).digest('hex'))   
            })
            let md5sum = await promise
            return md5sum
        }

        createHash().then(md5sum => {
            Tweet.find({hash:md5sum}, (err,t) => {
                if(t.length) {
                    console.log('tweet found', t)
                    res.send(md5sum)
                }
                else {
                    const newTweet = new Tweet({
                        tweet:tweet.join(' '),
                        hash:md5sum
                    })
                    newTweet.save()
                    res.send(md5sum)
                }
            })
        })
    })

    app.post('/api/likes', (req,res) => {
        res.send('asdf')
    })
}