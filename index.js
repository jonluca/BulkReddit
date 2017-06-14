const snoowrap = require('snoowrap');
var config = require('./config.js');
var express = require('express');
var app = express();
var path = require('path');
var request = require('request');

const prefix = "/BulkReddit";
app.use(prefix + '/', express.static(path.join(__dirname, 'public')));

const r = new snoowrap({
    userAgent: 'BulkReddit/1.0',
    clientId: config.secret.client_id,
    clientSecret: config.secret.secret,
    refreshToken: config.secret.refresh
});

//Force refresh API sooner than 5 minutes
app.get(prefix + "/", function(req, res) {
    res.status(200);
    res.render("landing.ejs");
    r.getSubreddit("talesfromtechsupport").getHot().then(function(data) {
        pbcopy(data);
    });
});




//Function to copy to clipboard - mac
function pbcopy(data) {
    var proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(JSON.stringify(data)); proc.stdin.end();
}