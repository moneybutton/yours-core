#!/usr/bin/env node
'use strict'
let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')
let fs = require('fs')
let app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../static')))
app.post('/', (req, res) => {
  let str = JSON.stringify(req.body) + "\n"
  fs.appendFile(path.join(__dirname, 'landing-page-form-submit.dat'), str, (err) => {
    console.log(str)
    if (err) {
      console.log('error on form submit: ' + err)
    }
  })
  res.sendFile('index.html', {root: path.join(__dirname, '../static')})
})

let server = app.listen(3050, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('View the app at http://%s:%s/', host, port)
})

module.exports.app = app
module.exports.server = server
