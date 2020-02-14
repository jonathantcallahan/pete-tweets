const path = require('path')

module.exports = app => {
    app.route('/').get((req,res) => res.sendFile(path.join(__dirname,'./../public/index.html')))
}