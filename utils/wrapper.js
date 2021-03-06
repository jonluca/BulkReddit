const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), {
  flags: 'a'
});

const morgan = require('morgan');

module.exports = function (app) {
  //Apache-like logs
  app.set('trust proxy', true);
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: accessLogStream
  }));

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.set("view engine", "ejs");

  app.listen(8063, 'localhost', function () {
    console.log("Listening on port 8063!");
  });
};