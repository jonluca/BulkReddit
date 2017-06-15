const snoowrap = require('snoowrap');
var config = require('./config.js');
var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var api_wrapper = require('./utils/wrapper.js');

const prefix = "/BulkReddit";
app.use(prefix + '/', express.static(path.join(__dirname, 'public')));

const r = new snoowrap({
    userAgent: 'BulkReddit/1.0',
    clientId: config.secret.client_id,
    clientSecret: config.secret.secret,
    refreshToken: config.secret.refresh
});
api_wrapper(app);

app.get(prefix + "/", function(req, res) {
    res.status(200);
    res.render("index.ejs");
});


app.get(prefix + "/download", function(req, res) {
    let time = req.body.time;
    var lowerTime = time.toLowerCase();
    let type = req.body.type;
    let numberOfPosts = req.body.numberOfPosts;
    let file = req.body.file;
    let subreddit = req.body.subreddit;

    //Validity check for time
    if (!validTime(lowerTime)) {
        lowerTime = "all";
    }

    switch (type) {
        case "Hot":
            r.getSubreddit(subreddit).getHot().then(parseData);
            break;
        case "Top":
            r.getSubreddit(subreddit).getTop({
                time: lowerTime
            }).then(parseData);
            break;
        case "New":
            r.getSubreddit(subreddit).getNew().then(parseData);
            break;
        case "Controversial":
            r.getSubreddit(subreddit).getControversial({
                time: lowerTime
            }).then(parseData);
            break;
        default:
            //If for some reason it does not match, default to top of all time
            r.getSubreddit(subreddit).getTop({
                time: 'all'
            }).then(parseData);
    }

    res.status(200);
    res.end();
}); //Function to copy to clipboard - mac
function pbcopy(data) {
    var proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(JSON.stringify(data)); proc.stdin.end();
}

function validTime(time) {
    return (["hour", "day", "week", "month", "year", "all"]).includes(time);
}

function parseData(data) {
    pbcopy(data);
}