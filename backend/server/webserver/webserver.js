var express = require('express');

var app = express();
var FRONTENDPATH = require('./constants').FRONTENDPATH;

app.use(express.static(__dirname+'/frontend'))



app.get('/', function(req, res){

   res.sendFile(FRONTENDPATH+"/views/client.html");

});


app.listen(8081);