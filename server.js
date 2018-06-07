var express = require('express');
var cookieParser = require('cookie-parser');
var crypto = require('bcryptjs');
var fs = require('fs');
var formidable = require('formidable');
var app = express();

const saltRounds = 10;

const loginCookieOptions = {
    maxAge : 1000 * 60 * 10, // expires after 10 minutes
    httpOnly : true,
    signed : true
};

var loginHash;
var cookieSecret;

var data = fs.readFileSync('secrets.json', 'utf8');
var secrets = JSON.parse(data);
if (secrets == null) {
    console.log("Couldn't parse secrets file.");
    process.exit(1);
}
loginHash = secrets.loginHash;
cookieSecret = secrets.cookieSecret;

app.use(cookieParser(cookieSecret));
app.use(express.json());

function sendHomePage(req, res)
{
    res.sendFile('index.html', {root: './'});
}

app.get('/', function(req, res, next) { 
    // cookieParser.
    if (req.signedCookies['logged-in'] == null) {
        res.cookie('logged-in', 'false', loginCookieOptions);
    }
    sendHomePage(req, res);
});

app.get('/login', function(req, res, next) {
    if (req.signedCookies['logged-in'] == 'true') {
        res.redirect('/');
    }
    else {
        res.sendFile('login.html', {root: './'});
    }
});

app.post('/login', function(req, res) {
    const numAttemptsOptions = {
        maxAge : 1000 * 60 * 60 * 24  
    };

    var numLoginAttempts = 0;
    if (req.cookies['login-fail'] != undefined) {
         numLoginAttempts = parseInt(req.cookies['login-fail']);
    }
    if (numLoginAttempts != NaN) {
        if (numLoginAttempts > 10) {
            console.log("10 failed consecutive logins. 24hr block set.");
            res.cookie('login-fail', toString(numLoginAttempts), numAttemptsOptions); // expires after 24hours
            res.sendFile('login.html', {root: './'});
            return;
        }
    }
    else {
        numLoginAttempts = 0;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        crypto.compare(fields.pw, loginHash).then(function(result) {
            if (result) {
                res.cookie('logged-in', 'true', loginCookieOptions);
                res.cookie('login-fail', '0', {maxAge: 0});
                console.log("Successful login.");
                sendHomePage(req, res);
            }
            else {
                // modify the page to say wrong login
                numLoginAttempts += 1;
                console.log("Login attempt failed. Login number: " + numLoginAttempts);
                res.cookie('login-fail', numLoginAttempts.toString(), numAttemptsOptions);
                res.sendFile('login.html', {root: './'});
            }
        }); 
    });
    
});

app.post('/', function(req, res, next) {
    if (req.signedCookies['logged-in'] != 'true') {
        sendHomePage(req, res);
        return;
    }
    var newPlayers = req.body;
    fs.writeFile("players.json", JSON.stringify(newPlayers), 'utf8', function (err, bytesWritten, buffer) {
        if (err) {
            console.log("Failed to update players.");
        }
        else {
            console.log("players.json has been updated with a new score.");
        }
    });
    res.redirect('/');
});

app.get('/*.png', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('/*.jpg', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('/table_generator.js', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('/table_appender.js', function(req, res, next) {
    if (req.signedCookies['logged-in'] == 'true') {
        res.sendFile(req.url, {root: './'});
    }
    else {
        res.send("function appendCallback(){}");
    }
});

app.get('/create', function(req, res, next) {
    if (req.signedCookies['logged-in'] == 'true') {
        res.sendFile('create.html', {root: './'});
    }
    else {
        res.redirect('/');
    }
});

app.post('/create', function(req, res, next) {
    if (req.signedCookies['logged-in'] == 'true') {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            var newSteamID = parseInt(fields.steamID);
            if (fields.steamName == undefined) {
                return;
            }
            if (newSteamID == NaN || newSteamID == undefined) {
                return;
            }
            if (files.profilePic != undefined) {
                if (files.profilePic.type == 'image/jpeg') {
                    fs.rename(files.profilePic.path, "./images/" + newSteamID + ".jpg");
                }
                else {
                    return;
                }
            }
            else {
                return;
            }
            fs.readFile("players.json", function (err, data) {
                if (err) {
                    return;
                }
                var players = JSON.parse(data);
                players.push({name: fields.steamName, wins: 0, losses: 0, steamID: newSteamID});
                fs.writeFile("players.json", JSON.stringify(players), 'utf8', function (err, bytesWritten, buffer) {
                    if (err) {
                        console.log("Failed to update players.");
                    }
                    else {
                        console.log("players.json has been updated with a new player.");
                    }
                });
            }); 
        });
    }
    res.redirect("/");
});

app.get('/logout', function(req,res, next) {
    res.cookie('logged-in', 'false', loginCookieOptions);
    res.redirect('/');
});

app.get('/players.json', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('/*.css', function(req, res, next) { 
    res.sendFile(req.url, {root: './'}); 
});

app.get('*', function(req, res){
    res.status(404).send("404");
});

app.listen(8080);