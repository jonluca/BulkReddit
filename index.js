const snoowrap = require('snoowrap');
const config = require('./config.js');
const express = require('express');
const app = express();
const path = require('path');

const api_wrapper = require('./utils/wrapper.js');
const fs = require('fs');
const markdownpdf = require("markdown-pdf");
const helmet = require('helmet');

app.use(helmet());
app.use('/', express.static(path.join(__dirname, 'public')));

const r = new snoowrap({
  userAgent: 'BulkReddit/1.0',
  clientId: config.secret.client_id,
  clientSecret: config.secret.secret,
  refreshToken: config.secret.refresh
});
api_wrapper(app);

app.get("/", function (req, res) {
  res.status(200);
  res.render("index.ejs");
});

app.post("/download", function (req, res) {
  let time = req.body.time;
  let lowerTime = time.toLowerCase();
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
      r.getSubreddit(subreddit).getHot().then(function (data) {
        parseData(data, file, res, comments);
      });
      break;
    case "Top":
      r.getSubreddit(subreddit).getTop({
        time: lowerTime
      }).then(function (data) {
        parseData(data, file, res, comments);
      });
      break;
    case "New":
      r.getSubreddit(subreddit).getNew().then(function (data) {
        parseData(data, file, res, comments);
      });
      break;
    case "Controversial":
      r.getSubreddit(subreddit).getControversial({
        time: lowerTime
      }).then(function (data) {
        parseData(data, file, res, comments);
      });
      break;
    default:
      //If for some reason it does not match, default to top of all time
      r.getSubreddit(subreddit).getTop({
        time: 'all'
      }).then(function (data) {
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
  if (file[0].indexOf("..") !== -1) {
    return false;
  }
  //Make sure there aren't multiple periods
  const splitFile = file[0].split('.');
  if (splitFile.length !== 2) {
    return false;
  }
  //Make sure first part is all numbers
  return !isNaN(splitFile[0]);

}

app.get("/data/*", function (req, res) {
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

function createDataIfDoesntExist() {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }
}

function parseData(data, filetype, res, comments) {
  createDataIfDoesntExist();
  let d = new Date();
  let n = d.getTime();
  let amountAdded = 0;
  if (filetype === "txt") {
    const stream = fs.createWriteStream("data/" + n + ".txt");
    for (let j = 0; j < data.length; j++) {
      if (data[j].is_self && !data[j].distinguished) {
        writeToText(stream, data[j]);
        if (++amountAdded >= 100) {
          break;
        }
      }
    }
    if (data.length === 0 || amountAdded === 0) {
      stream.write("Invalid subreddit or no self-posts to be found!\n");
    }
    stream.end();
    stream.on('finish', function () {
      res.send({
        url: "data/" + n + ".txt"
      });
      res.status(200);
      res.end();
    });

  } else {

    let mds = "# Reddit offline cache \n \n";

    for (let i = 0; i < data.length; i++) {
      if (data[i].is_self && data[i].distinguished === undefined && !data[i].stickied) {
        mds = writeToMarkdown(mds, data[i]);
        if (++amountAdded >= 100) {
          break;
        }
      }
    }
    if (data.length === 0 || amountAdded === 0) {
      mds += '# Invalid subreddit or no self-posts to be found!\n\n';
    }
    markdownpdf().from.string(mds).to("data/" + n + ".pdf", function () {
      res.send({
        url: "data/" + n + ".pdf"
      }).status(200).end();
    });

  }
}