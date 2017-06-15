const snoowrap = require('snoowrap');
var config = require('./config.js');
var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var api_wrapper = require('./utils/wrapper.js');
var fs = require('fs');

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


app.post(prefix + "/download", function(req, res) {
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
            r.getSubreddit(subreddit).getHot().then(function(data) {
                parseData(data, file, numberOfPosts, res);
            });
            break;
        case "Top":
            r.getSubreddit(subreddit).getTop({
                time: lowerTime
            }).then(function(data) {
                parseData(data, file, numberOfPosts, res);
            });
            break;
        case "New":
            r.getSubreddit(subreddit).getNew().then(function(data) {
                parseData(data, file, numberOfPosts, res);
            });
            break;
        case "Controversial":
            r.getSubreddit(subreddit).getControversial({
                time: lowerTime
            }).then(function(data) {
                parseData(data, file, numberOfPosts, res);
            });
            break;
        default:
            //If for some reason it does not match, default to top of all time
            r.getSubreddit(subreddit).getTop({
                time: 'all'
            }).then(function(data) {
                parseData(data, file, numberOfPosts, res);
            });
    }
});

app.get(prefix + "/data/*", function(req, res) {
    res.status(200);
    res.render("index.ejs");
});
//Function to copy to clipboard - mac
function pbcopy(data) {
    var proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(JSON.stringify(data)); proc.stdin.end();
}

function validTime(time) {
    return (["hour", "day", "week", "month", "year", "all"]).includes(time);
}

function parseData(data, filetype, numberOfPosts, res) {
    let d = new Date();
    let n = d.getTime();
    if (filetype == "txt") {
        var stream = fs.createWriteStream("data/" + n + "-" + numberOfPosts + ".txt");
        if (data.length == 0) {
            stream.write("Invalid subreddit or no posts to be found!\n");
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].is_self && data[i].distinguished == undefined) {
                stream.write(data[i].title + " - " + "/u/" + String(data[i].author.name) + "\n");
                stream.write("https://reddit.com" + data[i].permalink + "\n");
                stream.write("----------------------------------------\n\n");
                stream.write(data[i].selftext + "\n");
                stream.write("\n\n\n");
            }
        }
        res.send({
            url: "data/" + n + "-" + numberOfPosts + ".txt"
        });
        res.status(200);
        res.end();
    }
    console.log("got to data");
    pbcopy(data[3]);
}