$( document ).ready( function(){

const library = {}
const threeLibrary = {}
const source = '#source-text'
const userInput = '#user-input'

$('.sharing-options .button').mouseover(function(){
    $(this).find('.button-modal').css({'display':'block'})
}).mouseout(function () {
    $(this).find('.button-modal').css({'display':'none'})
})

$('.refresh').on('click', function() {
    window.location.href = '/'
})

new ClipboardJS('.share-button')

$('.share-button').on('click', function () {
    $('.clipboard-message-container').append("<div class='clipboard-message'>link copied to clipboard</div>")
})

var time = new Date()
var hour = time.getHours()
var minute = time.getMinutes()
var date = time.getDate()
var year = time.getFullYear()
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
var month = months[time.getMonth()]
$('.hour').text(hour)
$('.minute').text(minute)
$('.day').text(date)
$('.month').text(month)
$('.year').text(year)

document.querySelector('#window-location').value = window.location.href
$('#window-location').attr('value',window.location.href)

$('.comment').on('click', function(){
    const about = $('.about-modal')
    if(about.hasClass('display-about')){
        about.removeClass('display-about').addClass('hide-about')
    } else {
        about.removeClass('hide-about').addClass('display-about')
    }
})

$('.retweet').on('click', function(){
    window.open("http://twitter.com/intent/tweet?url=" + window.location.href + "&text=\"" + $(userInput).text() + "\" - Pete Buttigiegee (predictive tweet generator)&via=action_costanza")
})

setInterval(updateStats, 1000)
updateStats()

function updateStats() {
    $.post('/api/likes', {type:'count', target: 'likes'})
        .then(data => { $('.likes-num').text(data.likes) })
        .catch(err => { $('.likes-num').text('420'); console.log(err) })
    
    $.post('/api/likes', {type:'count', target: 'shares'})
        .then(data => { $('.shares-num').text(data.likes) })
        .catch(err => { $('.shares-num').text('420'); console.log(err) })
}


$('.like').on('click', function() {
    $.post('/api/likes', {type:'add', target: 'likes'})
    .then(data => {
        console.log(data)
        $('.likes-num')
        .text(data.likes)
        $(this).find('i').removeClass('far')
        .addClass('fas')

        $('.like').prepend('<i class="fas fa-heart heart-animation"></i>')
    })
    .catch(err => console.log(err))
})

$('.retweet, .share, .share-button').on('click', function() {
    $.post('/api/likes', {type:'add', target: 'shares'})
    .then(data => {
        console.log(data)
        $('.shares-num')
        .text(data.likes)
        $(this).find('i').addClass('green')

    })
    .catch(err => console.log(err))
})



const getWords = function(s, removeSentences = true){
    const space = new RegExp(/\n/g)
    const p = new RegExp(/\./g)
    const text = $(s).text().toLowerCase().replace(p,' .')
    const regexp = removeSentences ? new RegExp(/\,|\:|\(|\)|\;|\'|\"|\↵/g) : new RegExp(/\,|\:|\(|\)|\;|\'|\"|\!|\?/g)
    return text.replace(space,' ').replace(regexp,'').split(' ').filter(e=>e!='')
}


const store = function(){
    const words = getWords(source)
    words.forEach((e,i)=>{
        if(library[e] == undefined) library[e] = {}
        if(library[e][words[i+1]] == undefined) library[e][words[i+1]] = 0
        library[e][words[i+1]] ++
    })
}

const storeTwo = function(){
    const words = getWords(source)
    words.forEach((e,i)=>{
        if(i < words.length - 3){
            const two = `${e} ${words[i+1]}`
            if(library[two] == undefined) library[two] = {}
            if(library[two][words[i+2]] == undefined) library[two][words[i+2]] = 0
            library[two][words[i+2]] ++
        } 
    })
    store()
    // storeThree()
    document.getElementById('user-input').innerText = ''
    $('#submit').text('ready').css({'background-color':'green','color':'white','padding':'2px 4px','border':'0px'})
    $('#user-input').css('display','inline-block')
    $('#suggestion-container').css('display','block')
}

storeTwo()

// const storeThree = function(){
//     const words = getWords(source)
//     words.forEach((e,i)=>{
//         if(i<words.length-3){
//             if(threeLibrary[e] == undefined) threeLibrary[e] = {}
//             if(threeLibrary[e][words[i+2]] == undefined) threeLibrary[e][words[i+2]] = 0
//             threeLibrary[e][words[i+2]] ++
//         }
//     })
//     console.log(threeLibrary)
// }

//  async function suggestThree(){
//     const words = getWords(userInput)
//     const choices = []
//     if(words.length < 2){return}
//     const word = words[words.length - 2]
//     if(library[word] !== undefined){
//         //console.log('three running suggest')
//         const suggestions = library[word]
//         for(let w in suggestions){
//             if(suggestions[w] > 4){
//                 for(let i = 0; i<suggestions[w];i++){
//                     choices.push(w)
//                 }
//             }
//         }
//     }
//     //console.log(choices, 'three choices')
//     return choices
// }

$('#submit').click(function(){storeTwo()})
$('#source-text').keyup(function(e){
    if(e.keyCode == 13){
        storeTwo()
        $('#user-input').focus()
    }
})


async function suggest(e) {
    // if(e.keyCode !== 32){return}
    const choices = []
    const words = getWords(userInput),
        word = words[words.length - 1]
    suggestions = library[word]
    if(suggestions == undefined){ return }
    const r = [0,'']
    for(let w in suggestions){
        for(let i = 0; i<suggestions[w]; i++){
            choices.push(w)
        }
        if(suggestions[w] > r[0]){ r[0] = suggestions[w]; r[1] = w} 
    }
    // document.getElementById('user-input').value += r[1].length ? ` ${r[1]}` : '' 
    return choices
}

window.getWord = word => {
    $.post(`/api/word`, {word:word})
        .done(d => {console.log(d); window.word = d; return d})
        .catch(err => {console.log(err); return err})
}

async function sentenceAnalysis(choices){
    let calls = 0

    // get sentence
    const sentences = getWords(userInput,false).join(' ').split('.')
    const sentence = sentences[sentences.length - 1]

    // console.log(sentence, sentence.length ? 'sentence' : 'new sentence')

    
    // https://developer.oxforddictionaries.com/documentation
    const url = 'https://od-api.oxforddictionaries.com/api/v1'
    // analyze content of sentence

    const req = {
        sentence: sentence
    }

    // determine if begining of sentence

    const newSentence = !sentence.length

    // send sentence to API

    // $.ajax({
    //     type:'POST',
    //     url:'/api/dictionary',
    //     data:req
    // }).done(data => {
    //     // console.log(data)
    // })

    // tree for sentence structure

    // determine next word type(s) based on sentence

    // analyze choices to find best fit
    // if there are multiple acceptable options choose most heavily weighted

    // return next word and period if is end of sentence 
    return 0
}

function saveTweet() {
    const tweet = getWords(userInput)
    $.post('/api/save-tweet', {tweet: tweet})
    .done(d => {
        console.log(d)
        history.pushState({page:1}, 'Pete Tweets', '?tweetHash='+d)
        document.querySelector('#window-location').value = window.location.href
    })
    .catch(err => console.log(err))
}

let selection = ''

const suggestTwo = (e) => {
    if(window.location.href.match(/\?/g)) {
        function getQueryVariable(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            console.log('Query variable %s not found', variable);
        }
        console.log('tweet hash', getQueryVariable('tweetHash'))
        const tweetHash = getQueryVariable('tweetHash')
        $.post('/api/get-tweet', {hash:tweetHash})
        .done(res => {
            document.querySelector(userInput).innerText = res[0].tweet
            console.log(res)
        })
        .catch(err => console.log(err))
        return
    }

    // if users presses arrow set word to previously generated word
    const charLength = getWords(userInput).join(' ').split('').length
    if(e.keyCode == 39 ){        
        document.getElementById('user-input').innerText += selection == '.' ? `${selection} ` : ` ${selection}`
        selection = ''
        // generate next suggestion
        e.keyCode = 0
        suggestTwo(e)
        return
    }

    $('#submit').text('submit').css({'background-color':'white','color':'black','border':'1px solid black'})

    let choices = []
    const words = getWords(userInput)

    // get last two words from user input
    const two = `${words[words.length - 2]} ${words[words.length - 1]}`

    // if the most recently entered word does not exist do not try and create a reccomendation
    if(library[words[words.length - 1]] == undefined){ return }

    const suggestions = library[two]
    for(let word in suggestions){
        for(let i = 0; i<suggestions[word]; i++){
            choices.push(word, word)
        }
    }

    const key = e.keyCode
    suggest().then(d => {
        choices = choices.concat(d)
        sentenceAnalysis().then(sentenceData => {
            const index = Math.floor(Math.random() * choices.length)
            const choice = choices[index]
            selection = choice

            if(words[words.length - 1] == '.'){
                if(charLength > 50) { saveTweet(); return }
                selection = selection.split('')
                selection[0] = selection[0].toUpperCase()
                selection = selection.join('')
            }

            $('#suggestion').text(choice)
            if(charLength > 250) { saveTweet(); return }
            else { suggestTwo({keyCode:39}) }
            if(key !== 39){ return }
        })
    })

}

const startingWords = ['we','a','if','working','no','together','to','thats','in','isnt','each','it']
const randomWord = startingWords[Math.floor(startingWords.length * Math.random())]
$('#user-input').text(randomWord)

suggestTwo({keyCode:39})
// $('#user-input').keyup(e=>suggestTwo(e))



})