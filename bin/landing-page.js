#!/usr/bin/env node
'use strict'
let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')
let app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../static')))
app.post('/', (req, res) => {
  console.log(req.body)
})

let server = app.listen(3050, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('View the app at http://%s:%s/', host, port)
})

module.exports.app = app
module.exports.server = server
