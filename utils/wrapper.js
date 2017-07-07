var helmet = require('helmet');
var bodyParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), {
    flags: 'a'
});

var morgan = require('morgan');

module.exports = function(app) {
    app.use(helmet());
    //Apache-like logs
    app.set('trust proxy', true);
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
        stream: accessLogStream
    }));

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.set("view engine", "ejs");

    app.listen(8063, 'localhost', function() {
        console.log("Listening on port 8063!");
    });
};