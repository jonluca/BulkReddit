const snoowrap = require('snoowrap');
var config = require('./config.js');

// NOTE: The following examples illustrate how to use snoowrap. However, hardcoding
// credentials directly into your source code is generally a bad idea in practice (especially
// if you're also making your source code public). Instead, it's better to either (a) use a separate
// config file that isn't committed into version control, or (b) use environment variables.

// Create a new snoowrap requester with OAuth credentials.
// For more information on getting credentials, see here: https://github.com/not-an-aardvark/reddit-oauth-helper
const r = new snoowrap({
    userAgent: 'BulkReddit/1.0',
    clientId: config.secret.client_id,
    clientSecret: config.secret.secret,
    refreshToken: config.secret.refresh
});

r.getSubreddit("talesfromtechsupport").getHot().then(function(data) {
    pbcopy(data);
});

function pbcopy(data) {
    var proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(JSON.stringify(data)); proc.stdin.end();
}