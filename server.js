var express = require('express');
var app = express();

app.get('/', function(req, res, next) { 
    res.sendFile('index.html', {root: './'}); 
});

app.get('/*.png', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('/*.jpg', function(req, res, next) { 
    res.sendFile(req.url, {root: './images'}); 
});

app.get('/*.js', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('/*.json', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.listen(8080);
