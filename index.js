const snoowrap = require('snoowrap');
var config = require('./config.js');
var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var api_wrapper = require('./utils/wrapper.js');
var fs = require('fs');
var PDFDocument = require('pdfkit');
var markdownpdf = require("markdown-pdf");
var helmet = require('helmet');

app.use(helmet());
app.use('/', express.static(path.join(__dirname, 'public')));

const r = new snoowrap({
    userAgent: 'BulkReddit/1.0',
    clientId: config.secret.client_id,
    clientSecret: config.secret.secret,
    refreshToken: config.secret.refresh
});
api_wrapper(app);

app.get("/", function(req, res) {
    res.status(200);
    res.render("index.ejs");
});


app.post("/download", function(req, res) {
    let time = req.body.time;
    var lowerTime = time.toLowerCase();
    let type = req.body.type;
    let file = req.body.file;
    let subreddit = req.body.subreddit;
    let comments = req.body.comments;

    //Validity check for time
    if (!validTime(lowerTime)) {
        lowerTime = "all";
    }

    switch (type) {
        case "Hot":
            r.getSubreddit(subreddit).getHot().then(function(data) {
                parseData(data, file, res, comments);
            });
            break;
        case "Top":
            r.getSubreddit(subreddit).getTop({
                time: lowerTime
            }).then(function(data) {
                parseData(data, file, res, comments);
            });
            break;
        case "New":
            r.getSubreddit(subreddit).getNew().then(function(data) {
                parseData(data, file, res, comments);
            });
            break;
        case "Controversial":
            r.getSubreddit(subreddit).getControversial({
                time: lowerTime
            }).then(function(data) {
                parseData(data, file, res, comments);
            });
            break;
        default:
            //If for some reason it does not match, default to top of all time
            r.getSubreddit(subreddit).getTop({
                time: 'all'
            }).then(function(data) {
                parseData(data, file, res, comments);
            });
    }
});

//All valid files with match the signature "milliseconds[0-9].filename"
function validFile(file) {
    //If they request a file other than pdf or txt
    if (!file[0].endsWith("pdf") && !file[0].endsWith("txt")) {
        return false;
    }
    //If they try to do directory manipulation
    if (file[0].indexOf("..") != -1) {
        return false;
    }
    //Make sure there aren't multiple periods
    var splitFile = file[0].split('.');
    if (splitFile.length != 2) {
        return false;
    }
    //Make sure first part is all numbers
    if (isNaN(splitFile[0])) {
        return false;
    }

    return true;
}
app.get("/data/*", function(req, res) {
    if (!validFile(req.params)) {
        res.status(300);
        res.send("Not allowed");
        return;
    }

    res.download("data/" + req.params[0]); // Set disposition and send it.
});

function validTime(time) {
    return (["hour", "day", "week", "month", "year", "all"]).includes(time);
}

function writeToText(stream, data) {
    stream.write(data.title + " - " + "/u/" + String(data.author.name) + "\n");
    stream.write("https://reddit.com" + data.permalink + "\n");
    stream.write("----------------------------------------\n\n");
    stream.write(data.selftext + "\n");
    stream.write("\n\n\n");
}

function writeToMarkdown(origText, data) {
    origText += "## " + data.title + " - " + "/u/" + String(data.author.name) + "\n\n";
    origText += "### " + "https://reddit.com" + data.permalink + "\n \n";
    origText += "# " + "-------------------------------------\n\n";
    origText += data.selftext + "\n\n\n";
    return origText;
}

function parseData(data, filetype, res, comments) {
    let d = new Date();
    let n = d.getTime();
    var amountAdded = 0;
    if (filetype == "txt") {
        var stream = fs.createWriteStream("data/" + n + ".txt");
        for (var i = 0; i < data.length; i++) {
            if (data[i].is_self && data[i].distinguished == undefined) {
                writeToText(stream, data[i]);
                if (++amountAdded >= 100) {
                    break;
                }
            }
        }
        if (data.length == 0 || amountAdded == 0) {
            stream.write("Invalid subreddit or no self-posts to be found!\n");
        }
        stream.end();
        stream.on('finish', function() {
            res.send({
                url: "data/" + n + ".txt"
            });
            res.status(200);
            res.end();
        });

    } else {

        var mds = "# Reddit offline cache \n \n";

        for (var i = 0; i < data.length; i++) {
            if (data[i].is_self && data[i].distinguished == undefined && !data[i].stickied) {
                mds = writeToMarkdown(mds, data[i]);
                if (++amountAdded >= 100) {
                    break;
                }
            }
        }
        if (data.length == 0 || amountAdded == 0) {
            mds += '# Invalid subreddit or no self-posts to be found!\n\n';
        }
        markdownpdf().from.string(mds).to("data/" + n + ".pdf", function() {
            res.send({
                url: "data/" + n + ".pdf"
            });
            res.status(200);
            res.end();
        });

    }
}