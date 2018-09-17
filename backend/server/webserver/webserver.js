var express = require('express');

var app = express();
var FRONTENDPATH = require('./constants').FRONTENDPATH;

app.use(express.static(FRONTENDPATH))

app.get('/', function(req, res){

   res.sendFile(FRONTENDPATH+"/views/client.html");

});

app.listen(8081);

module.exports.app = app;x``